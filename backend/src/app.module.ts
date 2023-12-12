import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { NotifyModule } from './notify/notify.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, ChatModule, GameModule, NotifyModule, UserModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
