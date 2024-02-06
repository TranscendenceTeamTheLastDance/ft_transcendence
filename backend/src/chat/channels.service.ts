import { BadRequestException, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChannelRole, ChannelType, Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import { CreateChannelDTO, JoinChannelDTO } from './chat.dto';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async createChannel(createChatDto: CreateChannelDTO, user: User) {
    let createdChannel: any;
    try {
      console.log('createCHATDTO:', createChatDto);
      createdChannel = await this.prisma.channel.create({
        data: {
          name: createChatDto.name,
          type: createChatDto.type,
          ownerId: createChatDto.ownerId,
          password: createChatDto.password,
          users: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      return createdChannel;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException('Channel name must be unique');
      }
      throw e;
    }
  }
}