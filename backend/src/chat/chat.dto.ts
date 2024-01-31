import { ChannelType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, MaxLength, ValidateIf } from 'class-validator';

export class CreateChannelDTO {
  @MaxLength(20)
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @ValidateIf((o) => o.type === ChannelType.PROTECTED)
  @MaxLength(50)
  password: string;

  @IsNumber()
	ownerId: number;
}

export class CreateDmDTO {
  @IsNotEmpty()
  @MaxLength(8)
  login: string;
}

export class JoinChannelDTO {
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsOptional()
  @MaxLength(50)
  password: string;
}