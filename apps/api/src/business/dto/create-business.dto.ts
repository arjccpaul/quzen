import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Sector } from '@prisma/client';

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsEnum(Sector)
  sector: Sector;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
