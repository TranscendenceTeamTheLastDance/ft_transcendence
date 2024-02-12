import { BadRequestException, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChannelRole, ChannelType, Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import { CreateChannelDTO, JoinChannelDTO, SendMessageDTO } from './chat.dto';

// payload type that includes information about a channel and its users
type ChannelWithUsers = Prisma.ChannelGetPayload<{ include: { users: true } }>;

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async getChannel(channelName: string): Promise<ChannelWithUsers> {
    const channel = await this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: { users: true },
    });

    if (!channel) {
      throw new WsException(`Channel ${channelName} not found`);
    }

    return channel;
  }

  // retrieve the users from a specific channel
  async getChannelMembers(channelName: string): Promise<User[]> {
    const channel = await this.getChannel(channelName);

    if (!channel) {
      throw new WsException(`Channel ${channelName} not found`);
    }

    const channelUsers = await this.prisma.channelUser.findMany({
      where: {
        channelId: channel.id,
      },
      include: {
        user: true,
      },
    });

    return channelUsers.map((chanUser) => chanUser.user);
  }

  async createChannel(
    createChatDto: CreateChannelDTO,
    user: User,
  ): Promise<void> {
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

  async getJoinedChannels(user: User) {
    const channelUsers = await this.prisma.channelUser.findMany({
      where: {
        user: user,
      },
      include: {
        channel: {
          include: {
            messages: {
              orderBy: {
                id: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    // return the channel list without the password field
    // and with last message
    return channelUsers.map((cu: any) => {
      cu.channel.lastMessage = cu.channel.messages[0];
      delete cu.channel.messages;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...channelWithoutPassword } = cu.channel;
      return channelWithoutPassword;
    });
  }

  async sendMessage(message: SendMessageDTO, user: User) {
    const channel = await this.getChannel(message.channel);

    const channelUser = channel.users.find((u) => u.userId === user.id);
    if (!channelUser) {
      throw new WsException('You are not in this channel');
    }

    // if (this.muted.has(user.id)) {
    //   throw new WsException('You are muted in this channel');
    // }

    const created = await this.prisma.message.create({
      data: {
        content: message.content,
        author: { connect: { id: user.id } },
        channel: { connect: { name: channel.name } },
      },
      include: {
        author: true,
      },
    });

    return {
      createdAt: created.createdAt,
      content: created.content,
      channel: channel.name,
      user: {
        ...created.author,
        role: channelUser.role,
      },
    };
  }
}
