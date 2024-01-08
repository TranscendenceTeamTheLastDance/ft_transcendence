//Class that valides the token

import { Injectable, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';
import * as cookieParser from 'cookie-parser';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt',){
	constructor(config: ConfigService, private prisma: DatabaseService) {
		super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                let data =  (request as any).cookies['access_token'];
				return data;
            }]),
            secretOrKey: ('secret'),
        });
    }

	async validate(payload: {
		sub: string;
		name: string;
		email: string;
	}) {
		// console.log("Payload sub:", payload.sub);
		// console.log("Payload email:", payload.email)
		try {
			const user = await this.prisma.user.findUnique({
				where: { id: payload.sub },
			});
			return user;
		} catch (error) {
			console.error("Error fetching user:", error);
			return null;
		}
	}
	// 401[Unauthorised] if user is not found/token is wrong
}
