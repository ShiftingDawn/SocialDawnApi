import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./login.dto";
import { AuthGuard } from "./auth.guard";
import { Public } from "../public";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	async login(@Body() body: LoginDTO) {
		return { accessToken: await this.authService.login(body) };
	}

	@UseGuards(AuthGuard)
	@Get("test")
	testAuth() {}
}
