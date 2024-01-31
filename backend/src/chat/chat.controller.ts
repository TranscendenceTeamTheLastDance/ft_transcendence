import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { UserService } from 'src/user/user.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CreateChannelDTO } from './chat.dto';

// @UseGuards
@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
	constructor(private readonly channelsService: ChannelsService,
		private readonly userService: UserService) {}

}