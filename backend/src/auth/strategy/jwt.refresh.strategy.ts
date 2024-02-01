//Class that validate the refresh token

import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';
import { Request } from 'express';
import * as argon from 'argon2';



@Injectable() //  allow to inject the JwtStrategy class into other classes but also to inject other classes into the JwtStrategy class
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh',) // here we use 'jwt' as the name of the strategy
{
	constructor(private config: ConfigService, private prisma: DatabaseService)
	{
		super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                let data =  (request as any).cookies[config.get('JWT_REFRESH_TOKEN_COOKIE')];
				return data;
            }]),
            secretOrKey: config.get('JWT_REFRESH_SECRET'),
			passReqToCallback: true,
        });
    }

	async validate(req: Request, payload: {sub: number, email: string}) // we use the validate method to extract the payload from the token this function is used by the guard
	{ 
		const refreshToken = req.cookies[this.config.get('JWT_REFRESH_TOKEN_COOKIE')];

		const user = await this.prisma.user.findUnique({
			where: {
				id: payload.sub,
			},
		});
		if (!user) {
			throw new ForbiddenException('User not found');
		}
		const isRefreshTokenValid = await argon.verify(user.hashedRefreshToken, refreshToken);
		
		if (isRefreshTokenValid) {
			delete user.hash;
			delete user.hashedRefreshToken;
			return user;
		} else {
			throw new ForbiddenException('Invalid refresh token');
		}
	}
	// 401 if user is not found
}