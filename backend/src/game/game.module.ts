import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { PrismaService } from 'nestjs-prisma';



@Module({
    imports: [ ScheduleModule.forRoot()],
    providers: [GameGateway, GameService, PrismaService],
})
export class GameModule {}
