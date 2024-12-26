import { Body, Controller, Get, Post } from "@nestjs/common";
import { RegisterDTO } from "./register.dto";
import { UserService } from "./user.service";
import { Public } from "../public";
import { Self } from "./self.decorator";
import { User } from "./user.entity";
import { UserProfileDTO } from "./profile.dto";
import { getGravatarLink } from "../utils";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Public()
	@Post("register")
	async register(@Body() body: RegisterDTO) {
		await this.userService.register(body);
	}

	@Get("profile")
	getSelfProfile(@Self() user: User): UserProfileDTO {
		const { username, email } = user;
		return {
			username,
			email,
			thumbnail: getGravatarLink(email),
		};
	}
}
