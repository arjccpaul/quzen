import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JoinQueueDto } from './dto/join-queue.dto';
import { SignalDto } from './dto/signal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @UseGuards(JwtAuthGuard)
  @Post('join')
  joinQueue(@CurrentUser() user: any, @Body() dto: JoinQueueDto) {
    return this.queueService.joinQueue(user.id, dto);
  }

  @Get('status/:businessId')
  getQueueStatus(@Param('businessId') businessId: string) {
    return this.queueService.getQueueStatus(businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-tokens')
  getMyActiveTokens(@CurrentUser() user: any) {
    return this.queueService.getMyActiveTokens(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('token/:tokenId')
  getMyToken(@Param('tokenId') tokenId: string, @CurrentUser() user: any) {
    return this.queueService.getMyToken(tokenId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signal')
  processSignal(@CurrentUser() user: any, @Body() dto: SignalDto) {
    return this.queueService.processSignal(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('token/:tokenId/cancel')
  cancelToken(@Param('tokenId') tokenId: string, @CurrentUser() user: any) {
    return this.queueService.cancelToken(tokenId, user.id);
  }
}
