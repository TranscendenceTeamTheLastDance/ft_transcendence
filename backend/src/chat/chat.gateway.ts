import { Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { WSAuthMiddleware } from '../auth/ws/ws.middleware';
import { ChatEvent } from './chat.state';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from 'src/user/user.service';


@UseGuards(JwtGuard)
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  private io: Server;
  private logger: Logger = new Logger(ChatGateway.name);
  private userService: UserService;

  constructor(private jwtService: JwtService) {}


  afterInit(server: Server) {
    const authMiddleware = WSAuthMiddleware(this.jwtService, this.userService);
    server.use(authMiddleware);

    this.io.on('connection', (socket) => {
      this.logger.log('Client connected: ' + socket.id);
    });

    setInterval(() => this.io.emit('message', 'hello'), 2000);
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage(ChatEvent.Message)
  onMessage(@MessageBody() message: string): WsResponse<string> {
    return { event: ChatEvent.Message, data: 'You sent: ' + message };
  }
}