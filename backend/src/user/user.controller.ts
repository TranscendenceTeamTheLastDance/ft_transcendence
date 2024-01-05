import { UnauthorizedException, Controller, Get, UseGuards, Post, UseInterceptors, UploadedFile } from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { User } from "@prisma/client";
import { GetUser } from "../auth/decorator";
import { FileInterceptor } from '@nestjs/platform-express';
import { DatabaseService } from '../database/database.service';


@Controller('users')
export class UserController {
	constructor(private prisma: DatabaseService) {}

	@UseGuards(JwtGuard)
	@Get('me') // catches any '/users' requests if empty, else any '/users/me'
	getMe(@GetUser() user: User) { // see 2h18 for specific info
		return user; // the user object is from the validate strategy
	}

	@Post('upload-profile-picture')
	@UseInterceptors(FileInterceptor('file'))
	async uploadProfilePicture(@UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
	// Convert to Base64 and save
	console.log(user); 
	if (!user) {
		throw new UnauthorizedException('User not found in request');
	  }
	const imageBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
	await this.prisma.user.update({
		where: { id: user.id },
		data: { userPictu: imageBase64 },
	});
}

}