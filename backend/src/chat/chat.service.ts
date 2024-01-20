// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BadRequestException, Injectable } from '@nestjs/common';
import { Channel, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import { CreateChannelDTO } from './chat.dto';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async createChannel(channel: CreateChannelDTO) {
    try {
      await this.prisma.channel.create({
        data: channel as Channel,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Channel name must be unique');
      }
      throw e;
    }
  }
}