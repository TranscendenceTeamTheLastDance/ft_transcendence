import { ForbiddenException, Injectable, Query } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import * as argon from 'argon2';
import axios from 'axios';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from '@prisma/client';
import { create } from 'domain';
import { authenticator } from 'otplib';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {} //ConfigService is used to get the JWT_SECRET value from the .env file

  async signin42(code: string, res: Response): Promise<User> {
    try {
      const accessToken = await axios.post(
        'https://api.intra.42.fr/oauth/token',
        {
          grant_type: 'authorization_code',
          client_id: process.env.API_UID,
          client_secret: process.env.API_SECRET,
          code: code,
          redirect_uri: `http://${process.env.REACT_APP_SERVER_ADDRESS}:3000/signwith42`,
        },
        { headers: { 'Content-Type': 'application/json' } },
      );
      if (!accessToken.data['access_token']) {
        throw new ForbiddenException('Credential Incorrect');
      }
      const bearerToken = accessToken.data['access_token'];
      const user42info = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      if (!user42info.data['email'] || !user42info.data['login']) {
        throw new ForbiddenException('Credential Incorrect');
      }
      const email = user42info.data['email'];
      const username = user42info.data['login'];
      const user = await this.createupdateUser(email, username);
      user.hash = undefined;
      user.twoFactorSecret = undefined;
      user.status = 1;
      if (user.twoFactorEnabled) {
        return user;
      }
      await this.generateToken(user.id, user.email, user.username, res);
      return user;
    } catch (error) {
      throw new ForbiddenException('Invalid authorization code');
    }
  }

  async signin(dto: SigninDto, res: Response): Promise<User> {
    // find the user by email in the database
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if the user does not exist, throw an error
    if (!user) {
      console.log('user not found');
      throw new ForbiddenException('Credential Incorrect');
    }
    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // if paswsword does not match, throw an error
    if (!pwMatches) {
      console.log('password not found');
      throw new ForbiddenException('Credential Incorrect');
    }
    user.hash = undefined;
    user.twoFactorSecret = undefined;
    user.status = 1;
    if (user.twoFactorEnabled) {
      return user;
    }
    //this.createupdateUser(user.email, user.username);
    await this.generateToken(user.id, user.email, user.username, res);
    return user;
  }

  async signup(dto: SignupDto, res: Response): Promise<User> {
    // generate the password hash
    const hash = await argon.hash(dto.password);
    // save the new user to the database
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash,
          username: dto.username,
          status: 1,
          //connectionNb: 1,
        },
      });
      await this.generateToken(user.id, user.email, user.username, res);
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User already exists');
        }
      }
      throw error;
    }
  }

  async createupdateUser(email: string, username: string): Promise<User> {
    const userAlreadyExist = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
    if (userAlreadyExist) {
      if (userAlreadyExist.hash) {
        throw new ForbiddenException('Email already exists');
      }
      const updatedUser = await this.prismaService.user.update({
        where: {
          email: email,
        },
        data: {
          username: username,
        },
      });
      return updatedUser;
    } else {
      const newUser = await this.prismaService.user.create({
        data: {
          email: email,
          username: username,
        },
      });
      return newUser;
    }
  }

  async generateToken(
    userId: number,
    email: string,
    username: string,
    res: Response,
  ) {
    const accessToken = await this.signToken(userId, email, username, true);
    res.cookie(
      this.config.get('JWT_ACCESS_TOKEN_COOKIE'),
      accessToken.JWTtoken,
      {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
      },
    );

    const refreshToken = await this.signToken(userId, email, username, false);
    res.cookie(
      this.config.get('JWT_REFRESH_TOKEN_COOKIE'),
      refreshToken.JWTtoken,
      {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
      },
    );
    const hash = await argon.hash(refreshToken.JWTtoken);
    await this.prismaService.user.update({
      where: {
        email: email,
      },
      data: {
        hashedRefreshToken: hash,
      },
    });

    this.updateStatus(userId, 1);
  }

  async signToken(
    userId: number,
    email: string,
    username: string,
    accessToken: boolean,
  ): Promise<{ JWTtoken: string }> {
    const payload = {
      // here payload is the data we want to store in the token
      sub: userId, // here sub is used because it is the standard for the subject of the token
      email,
      username,
    };
    const secret = this.config.get('JWT_SECRET');
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET');

    if (accessToken) {
      const token = await this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret: secret,
      }); // the fonction signAsync is used to sign the token
      return { JWTtoken: token };
    } else {
      const token = await this.jwt.signAsync(payload, {
        expiresIn: '7d',
        secret: refreshSecret,
      }); // the fonction signAsync is used to sign the token
      return { JWTtoken: token };
    }
  }

  async Authenticate2FA(
    email: string,
    code: string,
    res: Response,
  ): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Credential Incorrect');
    }
    const isCodeValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isCodeValid) {
      throw new ForbiddenException('Invalid code');
    }

    await this.generateToken(user.id, user.email, user.username, res);
    return user;
  }

  async logout(user: User, res: Response) {
    try {
      await this.updateStatus(user.id, 0);
      res.clearCookie(this.config.get('JWT_ACCESS_TOKEN_COOKIE'), {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
      });
      res.clearCookie(this.config.get('JWT_REFRESH_TOKEN_COOKIE'), {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
      });
    } catch (error) {
      throw error;
    }
  }

  async refresh(user: User, res: Response) {
    const accessToken = await this.signToken(
      user.id,
      user.email,
      user.username,
      true,
    );
    res.cookie(
      this.config.get('JWT_ACCESS_TOKEN_COOKIE'),
      accessToken.JWTtoken,
      {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
      },
    );
  }

  async updateStatus(userId: number, status: number) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async getStatus(userId: number) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });
  }
}
