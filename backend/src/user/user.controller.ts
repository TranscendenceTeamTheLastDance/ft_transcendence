import {
  ForbiddenException,
  UnauthorizedException,
  Controller,
  Get,
  Res,
  Body,
  UseGuards,
  Post,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditUserDto } from './dto';
import { TwoFactorCodeDto } from './dto/two-factor-code.dto';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me') // me with stats
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user.id);
  }

  @UseGuards(JwtGuard)
  @Get('my-id')
  getMyId(@GetUser('id') userId: number) {
    return userId;
  }

  @Get('all')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtGuard)
  @Post('upload-profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: number,
  ) {
    const imageBase64 = `data:${file.mimetype};base64,${file.buffer.toString(
      'base64',
    )}`;
    await this.userService.uploadAvatar(userId, imageBase64);
  }

  @UseGuards(JwtGuard)
  @Patch()
  async editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
    @Res() res: Response,
  ) {
    console.log('user id being amended:', userId);
    console.log('dto of user being amended:', dto);
    await this.userService
      .editUser(userId, dto)
      .then(() => {
        res.send('backend: user successfully updated!');
      })
      // ForbiddenException : unautorized edit (email/username already exists, or wrong format)
      .catch((error: ForbiddenException) => {
        res.status(403).send(error.message);
      });
  }

  @UseGuards(JwtGuard)
  @Get('2FAInit')
  async twoFactorAuthInit(@GetUser() user: User) {
    console.log('backend: 2FA init');
    return this.userService.twoFactorAuthenticationInit(user);
  }

  @UseGuards(JwtGuard)
  @Post('2FAEnable')
  async twoFactorAuthEnable(
    @GetUser() user: User,
    @Body() dto: TwoFactorCodeDto,
    @Res() res: Response,
  ) {
    console.log('backend: 2FA ENABLE');
    this.userService
      .enableTwoFactorAuthentication(user, dto.code)
      .then(() => {
        res.send('2FA successfully enabled!');
      })
      .catch((error: UnauthorizedException) => {
        res.status(401).send(error.message);
      });
  }

  @UseGuards(JwtGuard)
  @Post('2FADisable')
  async twoFactorAuthDisable(
    @GetUser() user: User,
    @Body() dto: TwoFactorCodeDto,
    @Res() res: Response,
  ) {
    console.log('backend: 2FA DISABLE');
    this.userService
      .disableTwoFactorAuthentication(user, dto.code)
      .then(() => {
        res.send('2FA successfully disabled!');
      })
      .catch((error: UnauthorizedException) => {
        res.status(401).send(error.message);
      });
  }

  @UseGuards(JwtGuard)
  @Post('add-friend')
  async addFriend(
    @GetUser('id') userId: number,
    @Body('friendId') friendId: number,
  ) {
    return this.userService.addFriend(userId, friendId);
  }

  @UseGuards(JwtGuard)
  @Post('remove-friend')
  async removeFriend(
    @GetUser('id') userId: number,
    @Body('friendId') friendId: number,
  ) {
    return this.userService.removeFriend(userId, friendId);
  }

  @UseGuards(JwtGuard)
  @Get('friends')
  async getFriends(@GetUser('id') userId: number) {
    return this.userService.getFriends(userId);
  }
}
