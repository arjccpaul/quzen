import { IsString } from 'class-validator';

export class JoinQueueDto {
  @IsString()
  businessId: string;

  @IsString()
  categoryId: string;
}
