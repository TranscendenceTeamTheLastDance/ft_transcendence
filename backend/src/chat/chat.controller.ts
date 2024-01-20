import { Body, Controller, Post, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guard/jwt.guard
// import { ApiBearerAuth } from '@nestjs/swagger';

import { ChannelsService } from './chat.service';
import { CreateChannelDTO } from './chat.dto';

@Controller('chat')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class ChatController {
  constructor(private channelsService: ChannelsService) {}

  @Post('/createChannel')
  async createChannel(@Body() channel: CreateChannelDTO) {
    return this.channelsService.createChannel(channel);
  }
}