import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { JwtGuard } from '@/auth/guard/jwt.guard';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
	constructor(private channelsService: ChannelsService) {}
  
	@Get('/channelList')
	async getMyUser() {
	  return await this.channelsService.getChannelList();
	}
  }