import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard";
import { User } from "@prisma/client";
import { GetUser } from "src/auth/decorator";

@Controller('users')
export class UserController {
	@UseGuards(JwtGuard)
	@Get('me') // catches any '/users' requests if empty, else any '/users/me'
	getMe(@GetUser() user: User) { // see 2h18 for specific info
		return user; // the user object is from the validate strategy
	}
}