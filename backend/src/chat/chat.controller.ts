import { Body, Controller, Post, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guard/jwt.guard
// import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { ChannelsService } from './channels.service';
import { CreateChannelDTO } from './chat.dto';
import { GetUser } from 'src/auth/decorator';

@Controller('chat')
// @UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private channelsService: ChannelsService) {}

  @Post('/createChannel')
  async createChannel(@Body() channel: CreateChannelDTO, @GetUser() user: User) {
    return this.channelsService.createChannel(channel, user);
  }
}