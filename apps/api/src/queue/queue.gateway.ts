import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/queue' })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('QueueGateway');

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Client joins a room to watch a specific business queue
  @SubscribeMessage('watch-queue')
  handleWatchQueue(@MessageBody() businessId: string, @ConnectedSocket() client: Socket) {
    client.join(`business:${businessId}`);
    this.logger.log(`Client ${client.id} watching queue for business ${businessId}`);
  }

  // Client watches their own token
  @SubscribeMessage('watch-token')
  handleWatchToken(@MessageBody() tokenId: string, @ConnectedSocket() client: Socket) {
    client.join(`token:${tokenId}`);
  }

  // Called by QueueService when queue state changes
  async broadcastQueueUpdate(businessId: string, sessionId: string) {
    const tokens = await this.prisma.token.findMany({
      where: { sessionId, status: { in: ['WAITING', 'ARRIVED', 'IN_SERVICE'] } },
      include: { category: true },
      orderBy: { tokenNumber: 'asc' },
    });

    this.server.to(`business:${businessId}`).emit('queue-updated', {
      businessId,
      totalWaiting: tokens.length,
      tokens: tokens.map((t) => ({
        id: t.id,
        tokenNumber: t.tokenNumber,
        status: t.status,
        categoryName: t.category.name,
        estimatedWaitMin: t.estimatedWaitMin,
      })),
    });
  }

  // Notify a specific token holder
  notifyToken(tokenId: string, event: string, data: any) {
    this.server.to(`token:${tokenId}`).emit(event, data);
  }
}
