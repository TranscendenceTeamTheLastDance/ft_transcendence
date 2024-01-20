import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChannelsService } from './chat.service';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [ChatGateway, ChannelsService],
})
export class ChatModule {}