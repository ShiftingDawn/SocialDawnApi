import { Body, Controller, HttpCode, HttpStatus, Post, Put, Res } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { Public } from "@/public";
import { Cookies } from "@/cookies.decorator";
import { Self } from "@/self.decorator";
import { UserEntity } from "@/user/user.entity";
import { ChangePasswordRequestDTO, CreateUserDTO, LoginRequestDTO } from "@/auth/auth.req-dto";
import { SESSION_COOKIE } from "@/constants";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	async login(@Self() self: UserEntity, @Body() body: LoginRequestDTO, @Res({ passthrough: true }) res: Response) {
		if (self) return;
		const sessionId = await this.authService.createSession(body);
		res.cookie(SESSION_COOKIE, sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 315576000000, //100Y
		});
	}

	@Public()
	@Post("register")
	async register(@Body() body: CreateUserDTO) {
		await this.authService.register(body);
	}

	@Post("destroy")
	async destroy(
		@Self() user: UserEntity,
		@Cookies(SESSION_COOKIE) sessionId: string,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.authService.destroySession(user, sessionId);
		res.clearCookie(SESSION_COOKIE);
	}

	@Post("/ping")
	@HttpCode(HttpStatus.OK)
	update() {}

	@Put("password")
	async changePassword(@Self() user: UserEntity, @Body() body: ChangePasswordRequestDTO) {
		await this.authService.changePassword(user, body);
	}
}
