import { Logger, OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { ChatEvent } from './chat.state';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  io: Server;
  private logger: Logger = new Logger('ChatGateway');

  onModuleInit() {
    this.io.on('connection', (socket) => {
      this.logger.log('Client connected: ' + socket.id);
    });
  }

  @SubscribeMessage(ChatEvent.Message)
  onMessage(@MessageBody() message: string): WsResponse<string> {
    return { event: ChatEvent.Message, data: 'You sent: ' + message };
  }
}