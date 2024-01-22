import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
    imports: [ ScheduleModule.forRoot()],
    providers: [GameGateway, GameService],
})
export class GameModule {}
