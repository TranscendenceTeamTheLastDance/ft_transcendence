import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private database: DatabaseService, 
		private jwt: JwtService,
		private config: ConfigService,
	) {}
	s
	async signup(dto:AuthDto) : Promise<{ access_token: string }> {
		const user = await this.database.user.create({
			data: {
				name: dto.name,
				email: dto.email,
				password: dto.password,

			},
		});
		return this.signToken(user.id, user.name, user.email);
	}

	async signin(dto:AuthDto): Promise<{ access_token: string }>{
		const user = await this.database.user.findUnique({
			where: {
				email:dto.email,
			},
		});
		if (!user) {
			throw new ForbiddenException('Credientials Incorrect',);
		}

		const pwMatch = (user.password === dto.password);
		if (!pwMatch) {
			throw new ForbiddenException('Credientials Incorrect',);
		}

		return this.signToken(user.id, user.name, user.email);
	}

	async signToken(userId: string, name: string, email: string): Promise<{ access_token: string }> {
		const payload = {
			sub: userId,
			email,
			name
		}
		const secret =  this.config.get('JWT_SECRET');

		const token = await this.jwt.signAsync(payload, {
			expiresIn: '15m',
			secret: secret,
		});

		return {
			access_token: token
		};
	}
}