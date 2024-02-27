import {
  Body,
  Res,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { SignupDto, SigninDto } from './dto';
import { TwoFactorCodeDto } from '../user/dto/two-factor-code.dto';
import { JwtGuard, JwtRefreshGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { use } from 'passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('test')
  test() {
    return 'Hello !! World';
  }

  @Get('signin42')
  signin42(@Query() params: any, @Res() res: Response) {
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
            user,
          });
        }
      })
      .catch((err) => {
        res.status(401).json({ message: err.message });
      });
  }

  // this function creates a user in the database
  // unless you delete the volume
  // you can access your users on ${process.env.REACT_APP_SERVER_ADDRESS}:5555
  @Post('signup')
  signup(@Body() dto: SignupDto, @Res() res: Response) {
    this.authService
      .signup(dto, res)
      .then((user) => {
        console.log(user);
        res.status(201).json({
          message: 'signup success',
          user,
        });
      })
      .catch((err) => {
        res.status(401).json({ message: err.message });
      });
  }

  // this function will return Wrong Credentials
  // if the email or the name is wrong
  @Post('signin')
  signin(@Body() dto: SigninDto, @Res() res: Response) {
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
            user,
          });
        }
      })
      .catch((err) => {
        res.status(401).json({ message: err.message });
      });
  }

  @Post('Auth-2FA')
  async auth2FA(@Body() dto: TwoFactorCodeDto, @Res() res: Response) {
    this.authService
      .Authenticate2FA(dto.email, dto.code, res)
      .then((user) => {
        console.log(user);
        res.status(200).json({
          message: 'Authentication 2FA success',
          user,
        });
      })
      .catch((err) => {
        res.status(401).json({ message: err.message });
      });
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  logout(@GetUser() user: User, @Res() res: Response) {
    this.authService
      .logout(user, res)
      .then(() => {
        res.send('Successfully logued out!');
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@GetUser() user: User, @Res() res: Response) {
    this.authService
      .refresh(user, res)
      .then((user) => {
        res.status(200).json({
          message: 'refresh token success',
          user,
        });
      })
      .catch((error) => {
        res.status(401).json({ message: 'wrong credentials' });
      });
  }

  @Get('status')
  async getStatus(@GetUser('id') userId: number) {
    return this.authService.getStatus(userId);
  }

  @Post('update-status')
  async updateStatus(
    @GetUser('id') userId: number,
    @Body('status') status: number,
  ) {
    return this.authService.updateStatus(userId, status);
  }
}
