//Class that valides the token

import { Injectable, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';
import * as cookieParser from 'cookie-parser';


@Injectable() //  allow to inject the JwtStrategy class into other classes but also to inject other classes into the JwtStrategy class
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt',) // here we use 'jwt' as the name of the strategy
{
	constructor(config: ConfigService, private prisma: DatabaseService)
	{
		super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                let data =  (request as any).cookies[config.get('JWT_ACCESS_TOKEN_COOKIE')];
				return data;
            }]),
            secretOrKey: config.get('JWT_SECRET'),
        });
    }

	async validate(payload: {sub: number, email: string}) // we use the validate method to extract the payload from the token this function is used by the guard
	{ 
		const user = await this.prisma.user.findUnique({
			where: {
				id: payload.sub,
			},
		});
		delete user.hash;
		return user;
	}
	// 401 if user is not found
}

