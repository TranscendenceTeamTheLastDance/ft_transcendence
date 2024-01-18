import { Interval } from '@nestjs/schedule';

export class PongService {

    @Interval(10000)
    handleInterval() {
      console.log('Called every 10 seconds');
    }
}