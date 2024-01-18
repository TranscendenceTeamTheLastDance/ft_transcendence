import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EditUserDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserService {
  constructor(private prisma: DatabaseService) {}

  async uploadAvatar(userId: number, imageBase64: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { profilePic: imageBase64 },
      });
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
}
