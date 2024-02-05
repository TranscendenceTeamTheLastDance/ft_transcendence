import { Body, Res, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { SignupDto, SigninDto } from './dto';
import { TwoFactorCodeDto } from '../user/dto/two-factor-code.dto';


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
				if (user.twoFactorEnabled) {
                    res.json({
                        message: 'Two-Factor authentication required',
                        user,
                    });
				} else {
				console.log(user);
				res.status(201).json({
					message: 'signin with 42 success',
					user});
				}
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
		this.authService
			.signin(dto, res)
			.then((user) => {
				if (user.twoFactorEnabled) {
                    res.json({
                        message: 'Two-Factor authentication required',
                        user,
                    });
				} else {
				console.log(user);
				res.status(200).json({
					message: 'signin success',
					user});
				}
				})
			.catch((err) => {
				res.status(401).json({ message: 'wrong credentials' });
			});
	}

	@Post('Auth-2FA')
	async auth2FA(@Body() dto:TwoFactorCodeDto, @Res() res:Response){
		this.authService
			.Authenticate2FA(dto.email, dto.code, res)
			.then((user) => {
				console.log(user);
				res.status(200).json({
					message: 'Authentication 2FA success',
					user});
				})
			.catch((err) => {
				res.status(401).json({ message: 'wrong credentials' });
			});
	}

	@Get('logout')
	logout(@Res() res:Response){
		this.authService
			.logout(res)
			.then(() => {
                res.send('Successfully logued out!');
            })
			.catch((err) => {
				res.status(500).json({ message: 'Internal server error' });
			});
	}
}
