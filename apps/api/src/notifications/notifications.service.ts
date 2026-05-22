import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private logger = new Logger('NotificationsService');
  private messaging: admin.messaging.Messaging | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const projectId = this.config.get('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.config.get('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials missing — push notifications disabled');
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }

    this.messaging = admin.messaging();
    this.logger.log('Firebase Admin initialized');
  }

  async sendToToken(fcmToken: string, title: string, body: string, data?: Record<string, string>) {
    if (!this.messaging || !fcmToken) return;
    try {
      await this.messaging.send({
        token: fcmToken,
        notification: { title, body },
        data,
        webpush: {
          notification: { title, body, icon: '/icon-192x192.png' },
        },
      });
    } catch (err) {
      this.logger.error(`FCM send failed: ${err}`);
    }
  }

  async sendArrivalNudge(tokenId: string) {
    const token = await this.prisma.token.findUnique({
      where: { id: tokenId },
      include: { user: true, session: { include: { business: true } }, category: true },
    });
    if (!token?.user?.fcmToken) return;

    await this.sendToToken(
      token.user.fcmToken,
      'Time to head over!',
      `Your turn at ${token.session.business.name} is approaching. Please arrive soon.`,
      { tokenId, type: 'ARRIVAL_NUDGE' },
    );

    // Save notification record
    await this.prisma.notification.create({
      data: {
        userId: token.userId,
        tokenId,
        message: `Your turn at ${token.session.business.name} is approaching. Please arrive soon.`,
      },
    });
  }

  async sendCompletionNudge(tokenId: string) {
    const token = await this.prisma.token.findUnique({
      where: { id: tokenId },
      include: { user: true, session: { include: { business: true } }, category: true },
    });
    if (!token?.user?.fcmToken) return;

    await this.sendToToken(
      token.user.fcmToken,
      'Was your service completed?',
      `Help your next friend — tap to confirm if ${token.category.name} was completed at ${token.session.business.name}.`,
      { tokenId, type: 'COMPLETION_NUDGE' },
    );

    await this.prisma.notification.create({
      data: {
        userId: token.userId,
        tokenId,
        message: `Help your next friend — confirm if your service was completed at ${token.session.business.name}.`,
      },
    });
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
  }
}
