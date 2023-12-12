import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // makes our database accessible to all the modules in the app
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
