import { ChannelType } from '@prisma/client';
import {
  IsAlphanumeric,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateChannelDTO {
  @IsNotEmpty()
  @MaxLength(20)
  @IsAlphanumeric()
  name: string;

  @IsNotEmpty()
  @IsEnum(ChannelType)
  type: ChannelType;

  @ValidateIf((o) => o.type === ChannelType.PROTECTED)
  @IsNotEmpty()
  @MaxLength(50)
  password: string;
}

export class UpdateChannelDTO extends CreateChannelDTO {}

export class SendDmDTO {
  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

export class BlockUserDTO {
  @IsNotEmpty()
  @MaxLength(20)
  username: string;
}

export class JoinChannelDTO {
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsOptional()
  @MaxLength(50)
  password: string;
}

export class LeaveChannelDTO {
  @IsNotEmpty()
  @MaxLength(20)
  name: string;
}

export class SendMessageDTO {
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

export class MessageHistoryDTO {
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;

  @IsNotEmpty()
  @IsInt()
  @Max(100)
  @Min(1)
  limit: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  offset: number;
}

export class UserListInChannelDTO {
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;
}

export class PromoteUserDTO {
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;

  @IsNotEmpty()
  @MaxLength(20)
  username: string;
}

export class DemoteUserDTO extends PromoteUserDTO {}

export class KickUserDTO {
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;

  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @IsOptional()
  @MaxLength(100)
  reason: string;
}

export class BanUserDTO extends KickUserDTO {}

export class MuteUserDTO {
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;

  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @IsOptional()
  @MaxLength(100)
  reason: string;

  @IsNotEmpty()
  @IsInt()
  @Max(3600)
  @Min(1)
  duration: number; // mute duration in seconds
}