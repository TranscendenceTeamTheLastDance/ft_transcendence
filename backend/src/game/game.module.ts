import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GameGateway } from './game.gateway';
import { PongService } from './game.service';

@Module({
    imports: [ ScheduleModule.forRoot()],
    providers: [GameGateway, PongService],
})
export class GameModule {}
