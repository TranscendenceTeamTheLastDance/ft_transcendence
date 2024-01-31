import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  generateJWT(payload: any) {
	return this.jwtService.sign(payload);
  }

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() != 'ws') {
      return false;
    }

    const socket: Socket = context.switchToWs().getClient();
    const { token } = socket.handshake.headers; // handshake.auth

    try {
      this.jwtService.verify(token as string);
      return true;
    } catch (err) {
      return false;
    }
  }
}