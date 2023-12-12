import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
	constructor() {
		super({
			datasources: {
				db: {
					url: 'postgresql://postgres_user:postgres_password@postgres:5432/postgres_db'
				},
			},

		});
	}
}

