import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { UserService } from 'src/user/user.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CreateChannelDTO } from './chat.dto';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private channelsService: ChannelsService) {}

  @Get('/channelList')
  async getMyUser() {
    return await this.channelsService.getChannelList();
  }
}
