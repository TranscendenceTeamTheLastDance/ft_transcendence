//Class that valides the token

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt',){
	constructor(config: ConfigService, private prisma: DatabaseService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: ('secret')
		});
	}

	async validate(payload: {
		sub: string;
		email: string;
	}) {
		const user = 
		await this.prisma.user.findUnique ({
			where: {
				id: payload.sub,
			}, 
		});
		
		return user; // this is what gets exported to the user controller
	}
	// 401 if user is not found
}
