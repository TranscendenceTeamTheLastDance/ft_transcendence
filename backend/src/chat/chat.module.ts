import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChannelsService } from './channels.service';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChannelsService, PrismaService, UserService],
})
export class ChatModule {}