import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { NotifyModule } from './notify/notify.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    GameModule,
    NotifyModule,
    UserModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
