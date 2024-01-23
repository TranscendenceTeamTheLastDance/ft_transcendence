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
import { Response } from 'express';
import { UserService } from './user.service';
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
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
}
