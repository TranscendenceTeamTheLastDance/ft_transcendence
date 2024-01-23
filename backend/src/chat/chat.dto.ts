import { ChannelType } from '@prisma/client';
import { IsEnum, IsNotEmpty, MaxLength, ValidateIf } from 'class-validator';

export class CreateChannelDTO {
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsNotEmpty()
  @IsEnum(ChannelType)
  type: string;

  @IsNotEmpty()
  @ValidateIf((o) => o.type === ChannelType.PROTECTED)
  password: string;

  isDM: boolean;
}

export class JoinChannelDTO {
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;
}