import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueGateway } from './queue.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { JoinQueueDto } from './dto/join-queue.dto';
import { SignalDto } from './dto/signal.dto';

@Injectable()
export class QueueService {
  constructor(
    private prisma: PrismaService,
    private gateway: QueueGateway,
    private notifications: NotificationsService,
  ) {}

  private async getOrCreateSession(businessId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.queueSession.upsert({
      where: { businessId_date: { businessId, date: today } },
      update: {},
      create: { businessId, date: today, status: 'ACTIVE' },
    });
  }

  private async calculateEta(sessionId: string, categoryId: string): Promise<number> {
    const category = await this.prisma.serviceCategory.findUnique({ where: { id: categoryId } });
    if (!category) return 10;
    const ahead = await this.prisma.token.count({
      where: { sessionId, categoryId, status: { in: ['WAITING', 'ARRIVED', 'IN_SERVICE'] } },
    });
    return ahead * category.avgDurationMinutes;
  }

  async joinQueue(userId: string, dto: JoinQueueDto) {
    const business = await this.prisma.business.findUnique({ where: { id: dto.businessId } });
    if (!business || !business.isActive) throw new NotFoundException('Business not found');

    const category = await this.prisma.serviceCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category || !category.isActive) throw new NotFoundException('Category not found');

    const session = await this.getOrCreateSession(dto.businessId);

    const existing = await this.prisma.token.findFirst({
      where: { sessionId: session.id, userId, status: { in: ['WAITING', 'ARRIVED', 'IN_SERVICE'] } },
    });
    if (existing) throw new BadRequestException('You already have an active token for this queue');

    const lastToken = await this.prisma.token.findFirst({
      where: { sessionId: session.id },
      orderBy: { tokenNumber: 'desc' },
    });
    const tokenNumber = (lastToken?.tokenNumber ?? 0) + 1;
    const estimatedWaitMin = await this.calculateEta(session.id, dto.categoryId);

    const token = await this.prisma.token.create({
      data: { sessionId: session.id, userId, categoryId: dto.categoryId, tokenNumber, estimatedWaitMin },
      include: { category: true, session: { include: { business: true } } },
    });

    this.gateway.broadcastQueueUpdate(dto.businessId, session.id);

    const nudgeDelay = Math.max((estimatedWaitMin - 10) * 60 * 1000, 30000);
    setTimeout(() => this.notifications.sendArrivalNudge(token.id), nudgeDelay);
    const completionDelay = (estimatedWaitMin + 5) * 60 * 1000;
    setTimeout(() => this.notifications.sendCompletionNudge(token.id), completionDelay);

    return token;
  }

  async getQueueStatus(businessId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const session = await this.prisma.queueSession.findUnique({
      where: { businessId_date: { businessId, date: today } },
    });
    if (!session) return { tokens: [], totalWaiting: 0, session: null };

    const tokens = await this.prisma.token.findMany({
      where: { sessionId: session.id, status: { in: ['WAITING', 'ARRIVED', 'IN_SERVICE'] } },
      include: { category: true },
      orderBy: { tokenNumber: 'asc' },
    });

    return {
      session,
      totalWaiting: tokens.length,
      tokens: tokens.map((t) => ({
        id: t.id,
        tokenNumber: t.tokenNumber,
        status: t.status,
        categoryName: t.category.name,
        estimatedWaitMin: t.estimatedWaitMin,
        issuedAt: t.issuedAt,
      })),
    };
  }

  async getMyToken(tokenId: string, userId: string) {
    const token = await this.prisma.token.findUnique({
      where: { id: tokenId },
      include: { category: true, session: { include: { business: true } } },
    });
    if (!token || token.userId !== userId) throw new NotFoundException('Token not found');

    const ahead = await this.prisma.token.count({
      where: {
        sessionId: token.sessionId,
        categoryId: token.categoryId,
        tokenNumber: { lt: token.tokenNumber },
        status: { in: ['WAITING', 'ARRIVED', 'IN_SERVICE'] },
      },
    });

    return { ...token, aheadCount: ahead };
  }

  async processSignal(userId: string, dto: SignalDto) {
    const token = await this.prisma.token.findUnique({
      where: { id: dto.tokenId },
      include: { category: true },
    });
    if (!token || token.userId !== userId) throw new NotFoundException('Token not found');
    if (token.status === 'COMPLETED' || token.status === 'CANCELLED') {
      throw new BadRequestException('Token is already closed');
    }

    await this.prisma.feedbackSignal.create({
      data: { tokenId: dto.tokenId, userId, signalType: dto.signalType },
    });

    if (dto.signalType === 'ARRIVED') {
      await this.prisma.token.update({
        where: { id: dto.tokenId },
        data: { status: 'ARRIVED', arrivedAt: new Date() },
      });
    }

    if (dto.signalType === 'COMPLETED') {
      const now = new Date();
      await this.prisma.token.update({
        where: { id: dto.tokenId },
        data: { status: 'COMPLETED', completedAt: now },
      });

      if (token.arrivedAt) {
        const actualMinutes = Math.round((now.getTime() - token.arrivedAt.getTime()) / 60000);
        if (actualMinutes > 0 && actualMinutes < 120) {
          const newAvg = Math.round(token.category.avgDurationMinutes * 0.8 + actualMinutes * 0.2);
          await this.prisma.serviceCategory.update({
            where: { id: token.categoryId },
            data: { avgDurationMinutes: newAvg },
          });
        }
      }

      const session = await this.prisma.queueSession.findUnique({ where: { id: token.sessionId } });
      if (session) this.gateway.broadcastQueueUpdate(session.businessId, session.id);
    }

    return { success: true, signalType: dto.signalType };
  }

  async getMyActiveTokens(userId: string) {
    return this.prisma.token.findMany({
      where: { userId, status: { in: ['WAITING', 'ARRIVED', 'IN_SERVICE'] } },
      include: { category: true, session: { include: { business: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async cancelToken(tokenId: string, userId: string) {
    const token = await this.prisma.token.findUnique({ where: { id: tokenId } });
    if (!token || token.userId !== userId) throw new NotFoundException('Token not found');
    if (['COMPLETED', 'CANCELLED'].includes(token.status)) {
      throw new BadRequestException('Token is already closed');
    }

    await this.prisma.token.update({
      where: { id: tokenId },
      data: { status: 'CANCELLED' },
    });

    const session = await this.prisma.queueSession.findUnique({ where: { id: token.sessionId } });
    if (session) this.gateway.broadcastQueueUpdate(session.businessId, session.id);

    return { success: true };
  }
}
