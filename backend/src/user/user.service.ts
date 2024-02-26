import {
  ForbiddenException,
  NotFoundException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EditUserDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: DatabaseService) {}

  async getMe(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        gamesWon: {
          select: {
            winnerScore: true,
          },
        },
        gamesLose: true,
      },
    });
  }

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

  async getUserByUsername(username: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username: username },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  // get all existing users
  // should i order these by rank???
  async getAllUsers() {
    const users = await this.prisma.user.findMany();
    return users;
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
      if (dto.hash) {
        dto.hash = await argon.hash(dto.hash);
      }
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

  async twoFactorAuthenticationInit(
    user: User,
  ): Promise<{ qrCode: string; secret: string }> {
    const secret = authenticator.generateSecret();

    const otpauthURL = authenticator.keyuri(
      user.email,
      '2FATranscendance',
      secret,
    );

    this.editUser(user.id, { twoFactorSecret: secret });

    const qrCode = await toDataURL(otpauthURL);

    return { qrCode, secret };
  }

  async enableTwoFactorAuthentication(user: User, code: string) {
    const codeValide = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });
    if (!codeValide) throw new ForbiddenException('Invalid code');
    this.editUser(user.id, { twoFactorEnabled: true });
  }

  async disableTwoFactorAuthentication(user: User, code: string) {
    const codeValide = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });
    if (!codeValide) throw new ForbiddenException('Invalid code');
    this.editUser(user.id, { twoFactorEnabled: false, twoFactorSecret: null });
  }

  async addFriend(userId: number, friendId: number) {
    // Check if the friendship already exists to avoid duplicates
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existingFriendship) {
      throw new ForbiddenException('Friendship already exists.');
    }

    return this.prisma.friendship.create({
      data: {
        userId,
        friendId,
      },
    });
  }

  async removeFriend(
    userId: number,
    friendId: number,
  ): Promise<{ count: number }> {
    return this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
  }

  async getFriends(userId: number): Promise<User[]> {
    const userWithFriends = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        friendships: {
          select: {
            friend: true,
          },
        },
        friendOf: {
          select: {
            user: true,
          },
        },
      },
    });

    if (!userWithFriends) {
      throw new NotFoundException('User not found.');
    }

    // Combine friends from both relationships and remove duplicates if any
    const friends = [
      ...userWithFriends.friendships.map((f) => f.friend),
      ...userWithFriends.friendOf.map((f) => f.user),
    ];

    // Assuming you want to return distinct friends
    return Array.from(new Set(friends.map((friend) => friend.id))).map((id) =>
      friends.find((friend) => friend.id === id),
    );
  }

  async blockUser(blockedUserLogin: string, user: User) {
    if (blockedUserLogin === user.username) {
      throw new BadRequestException('You cannot block yourself');
    }

    // make sure that the other user exists
    await this.getUnique(blockedUserLogin);

    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        blocked: {
          connect: { username: blockedUserLogin },
        },
      },
      include: {
        blocked: true,
      },
    });
  }

  async unblockUser(toUnblockLogin: string, user: User) {
    // make sure that the other user exists
    await this.getUnique(toUnblockLogin);

    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        blocked: {
          disconnect: { username: toUnblockLogin },
        },
      },
      include: {
        blocked: true,
      },
    });
  }

  async getBlockedList(user: User) {
    const userWithBlocked = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        blocked: true,
      },
    });

    return userWithBlocked!.blocked;
  }
}
