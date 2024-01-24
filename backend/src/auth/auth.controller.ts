import { Body, Res, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { SignupDto, SigninDto } from './dto';

@Controller('auth')
export class AuthController {
	constructor (private authService: AuthService) {}

	@Get('test')
	test(){
		return 'Hello !! World'
	}

	@Get('signin42')
	signin42(@Query() params:any, @Res() res:Response){
		this.authService
			.signin42(params.code, res)
			.then((user) => {
				console.log(user);
				res.status(201).json({
					message: 'signin with 42 success',
					user});
				})
			.catch((err) => {
				res.status(401).json({ message: 'wrong credentials' });
			});
	}

	// this function creates a user in the database 
	// unless you delete the volume
	// you can access your users on localhost:5555
	@Post('signup')
	signup(@Body() dto:SignupDto, @Res() res:Response){
		this.authService
			.signup(dto, res)
			.then((user) => {
				console.log(user);
				res.status(201).json({
					message: 'signup success',
					user});
			})
			.catch((err) => {
				res.status(401).json({ message: 'signup rate' });
			});
	}

	// this function will return Wrong Credentials
	// if the email or the name is wrong
	@Post('signin')
	signin(@Body() dto:SigninDto, @Res() res:Response){
		console.log(dto);
		this.authService
			.signin(dto, res)
			.then((user) => {
				console.log(user);
				res.status(200).json({
					message: 'signin success',
					user});
				})
			.catch((err) => {
				res.status(401).json({ message: 'wrong credentials' });
			});
	}
}
