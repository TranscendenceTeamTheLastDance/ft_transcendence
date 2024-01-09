import { Body, Res, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
	constructor (private authService: AuthService) {}

	@Get('test')
	test(){
		return 'Hello !! World'
	}

	// this function creates a user in the database 
	// unless you delete the volume
	// you can access your users on localhost:5555
	@Post('signup')
	signup(@Body() dto:AuthDto, @Res() res:Response){
		this.authService
			.signup(dto, res)
			.then((user) => {
				console.log(user);
				res.status(201).json(user);
			})
			.catch((err) => {
				res.status(401).json({ message: 'signup rate' });
			});
	}

	// this function will return Wrong Credentials
	// if the email or the name is wrong
	@Post('signin')
	signin(@Body() dto:AuthDto){
		return this.authService.signin(dto);
	}
}
