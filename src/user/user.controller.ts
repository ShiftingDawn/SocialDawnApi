import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { Public } from "@/public";
import { CreateUserDTO } from "@/user/user.req-dto";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Public()
	@Post("register")
	async register(@Body() body: CreateUserDTO) {
		await this.userService.register(body);
	}
}
