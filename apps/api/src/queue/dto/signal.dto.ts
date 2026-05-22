import { IsEnum, IsString } from 'class-validator';
import { SignalType } from '@prisma/client';

export class SignalDto {
  @IsString()
  tokenId: string;

  @IsEnum(SignalType)
  signalType: SignalType;
}
