import { ChannelType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, MaxLength, ValidateIf } from 'class-validator';

export class CreateChannelDTO {
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsNotEmpty()
  @IsEnum(ChannelType)
  type: ChannelType;

  @ValidateIf((o) => o.type === ChannelType.PROTECTED)
  @IsNotEmpty()
  @MaxLength(50)
  password: string;
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