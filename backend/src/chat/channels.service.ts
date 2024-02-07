import { BadRequestException, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChannelRole, ChannelType, Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import { CreateChannelDTO, JoinChannelDTO } from './chat.dto';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async createChannel(createChatDto: CreateChannelDTO, user: User): Promise<void>  {
    let createdChannel: any;
    try {
      createdChannel = await this.prisma.channel.create({
        data: {
          name: createChatDto.name,
          type: createChatDto.type,
          password: createChatDto.password,
          isDM: false,
          users: {
            create: [
              {
                user: { connect: user },
                role: ChannelRole.OWNER,
              },
            ],
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

  async joinChannel(channelDTO: JoinChannelDTO, user: User) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelDTO.name,
      },
      include: { users: true },
    }); 

    if (!channel) {
      throw new WsException(`Channel ${channelDTO.name} not found`);
    }

    if (channel.type === ChannelType.PRIVATE) {
      throw new WsException(`Channel ${channel.name} is private`);
    }

    if (channel.type === ChannelType.PROTECTED) {
      if (!channelDTO.password) {
        throw new WsException(`Channel ${channel.name} requires a password`);
      }

      // channel.password is never empty
      const isPasswordValid = channelDTO.password === channel.password;
      if (!isPasswordValid) {
        throw new WsException(`Invalid password for channel ${channel.name}`);
      }
    }

    const channelUser = await this.prisma.channelUser.create({
      data: {
        user: { connect: user },
        role: ChannelRole.USER,
        channel: { connect: { name: channelDTO.name } },
      },
      include: {
        user: true,
      },
    });

    return {
      toChannel: {
        channel: channel.name,
        user: {
          ...channelUser.user,
          role: ChannelRole.USER,
        },
      },
      toClient: {
        id: channel.id,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
        name: channel.name,
        type: channel.type,
        isDM: channel.isDM,
      },
    };
  }

  async getChannelList() {
    const channels: any = await this.prisma.channel.findMany({
      where: {
        type: {
          not: ChannelType.PRIVATE,
        },
        isDM: {
          not: true,
        },
      },
      // exclude password and isDM field
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        type: true,
        name: true,
        messages: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
        },
      },
    });

    channels.forEach((channel: any) => {
      if (channel.type === ChannelType.PUBLIC) {
        channel.lastMessage = channel.messages[0];
      }

      delete channel.messages;
    });

    return channels;
  }
}
