import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EditUserDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import {authenticator} from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class UserService {
  constructor(private prisma: DatabaseService) {}

  async getUnique(email: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatar(userId: number, imageBase64: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { profilePic: imageBase64 },
      });
      console.log('backend: profile pic successfully updated');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async editUser(userId: number, dto: EditUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...dto,
        },
      });
      console.log('backend: current user info:', user);
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.log(error.meta);
          if (error.meta.target[0] === 'username')
            throw new ForbiddenException('Username already exists');
          else if (error.meta.target[0] === 'email')
            throw new ForbiddenException('Email already exists');
          else throw new ForbiddenException('Invalid credentials');
        }
      }
      throw error;
    }
  }

  async twoFactorAuthenticationInit(user: User)
  : Promise<{qrCode: string; secret: string}> {

    const secret = authenticator.generateSecret();

    const otpauthURL = authenticator.keyuri(user.email, '2FATranscendance', secret);

    this.editUser(user.id, {twoFactorSecret: secret});
    
    const qrCode = await toDataURL(otpauthURL);
    
    return {qrCode, secret};
  }

  async enableTwoFactorAuthentication(user: User, code: string) {
    const codeValide = authenticator.verify({
      token: code, 
      secret: user.twoFactorSecret});
    if (!codeValide) 
      throw new ForbiddenException('Invalid code');
    this.editUser(user.id, {twoFactorEnabled: true});
    }

  async disableTwoFactorAuthentication(user: User, code: string) {
    const codeValide = authenticator.verify({
      token: code, 
      secret: user.twoFactorSecret});
    if (!codeValide) 
      throw new ForbiddenException('Invalid code');
    this.editUser(user.id, {twoFactorEnabled: false, twoFactorSecret: null});
  }
}
