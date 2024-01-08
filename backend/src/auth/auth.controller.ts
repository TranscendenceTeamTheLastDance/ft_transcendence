import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Response } from 'express';

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
    async signup(@Body() dto: AuthDto, @Res() res: Response) {
        const tokenData = await this.authService.signup(dto);
        res.cookie('access_token', tokenData.access_token, {
			httpOnly: true,
			secure: false, // true if using HTTPS
			domain: 'localhost', // Optional: set if facing issues
			path: '/', // Accessible across the entire backend
        });
        res.send({ message: 'Signup successful' });
    }

	// this function will return Wrong Credentials
	// if the email or the name is wrong
	@Post('signin')
    async signin(@Body() dto: AuthDto, @Res() res: Response) {
        const tokenData = await this.authService.signin(dto);
        res.cookie('access_token', tokenData.access_token, {
            // httpOnly: true,
            // sameSite: 'strict',
        });
        res.send({ message: 'Signin successful' });
    }
}
