import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  static forRoot(arg0: {
    isGlobal: boolean;
  }):
    | import('@nestjs/common').Type<any>
    | import('@nestjs/common').DynamicModule
    | Promise<import('@nestjs/common').DynamicModule>
    | import('@nestjs/common').ForwardReference<any> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }
  async onModuleInit() {
    await this.$connect();
    Logger.log('Prisma connected', 'PrismaService');
  }
}