import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
	constructor(private database: DatabaseService) {}
	
	async signup(dto:AuthDto) {
		const user = await this.database.user.create({
			data: {
				name: dto.name,
				email: dto.email,
				password: dto.password,

			},
		});
		return user
	}

	async signin(dto:AuthDto) {
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

		return user;
	}
}
