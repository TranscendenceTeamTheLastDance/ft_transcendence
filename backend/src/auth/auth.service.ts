import { ForbiddenException, Injectable } from "@nestjs/common";
import { DatabaseService } from '../database/database.service';
import { AuthDto } from "./dto/auth.dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Response } from "express"
import { User } from "@prisma/client";

@Injectable({})
export class AuthService {
	constructor(private prismaService: DatabaseService, 
				private jwt: JwtService,
				private config: ConfigService) {} //ConfigService is used to get the JWT_SECRET value from the .env file
	async signin(dto:AuthDto) {
		// find the user by email in the database
		const user = await this.prismaService.user.findUnique({
			where: {
				email: dto.email,
			}
		
		})
		// if the user does not exist, throw an error
		if (!user) {
			throw new ForbiddenException("Credential Incorrect")
		}
		// compare password
		const pwMatches = await argon.verify(user.hash, dto.password)
		// if paswsword does not match, throw an error
		if (!pwMatches) {
			throw new ForbiddenException("Credential Incorrect")
		}
		return this.signToken(user.id, user.email, user.name);
	}

	
	async signup(dto:AuthDto, res:Response) : Promise<User>{
		// generate the password hash
		const hash = await argon.hash(dto.password)
		// save the new user to the database
		try {
			const user = await this.prismaService.user.create({
				data: {
					email: dto.email,
					hash,
					name: dto.name,
				},
			});
			await this.generateToken(user.id, user.email, user.name, res);
			return user;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException("Email already exists")
				}
			}
			throw error;
		}
	}

	async generateToken(userId:number, email:string, name:string, res:Response) {
		const accessToken = await this.signToken(userId, email, name);
		res.cookie(this.config.get('JWT_ACCESS_TOKEN_COOKIE'),
			accessToken.JWTtoken,
			{
				httpOnly: true,
				secure: false,
				sameSite: 'strict',
			},
		)
	}

	async signToken(userId:number, email:string, name:string): Promise<{ JWTtoken: string }> {
		const payload = { // here payload is the data we want to store in the token
			sub:userId,// here sub is used because it is the standard for the subject of the token
			email,
			name,
		}
		const secret = this.config.get('JWT_SECRET')
	
		const token = await this.jwt.signAsync(payload, {expiresIn: '15m', secret: secret}) // the fonction signAsync is used to sign the token
	
		return {JWTtoken: token,};
	}
}