import { Module, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy/jwt.refresh.strategy';

@Module({
	imports:[JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
	exports: [AuthService, JwtModule, JwtStrategy]
})
export class AuthModule {}
