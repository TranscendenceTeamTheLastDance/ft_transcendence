import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { NotifyModule } from './notify/notify.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, ChatModule, GameModule, NotifyModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
