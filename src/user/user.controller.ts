import { Body, Controller, Post } from "@nestjs/common";
import { RegisterDTO } from "./register.dto";
import { UserService } from "./user.service";
import { Public } from "../public";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Public()
	@Post("register")
	async register(@Body() body: RegisterDTO) {
		await this.userService.register(body);
	}
}
