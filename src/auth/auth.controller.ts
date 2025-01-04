import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Res } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { Public } from "@/public";
import { Cookies } from "@/cookies.decorator";
import { Self } from "@/self.decorator";
import { UserEntity } from "@/user/user.entity";
import {
	ChangePasswordRequestDTO,
	CreateUserDTO,
	LoginCodeRequestDTO,
	LoginRequestDTO,
	OneTimeCodeRequestDTO,
} from "@/auth/auth.req-dto";
import { SESSION_COOKIE } from "@/constants";
import { LoginResponseDTO, TotpStatusResponseDTO } from "@/auth/auth.res-dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	async login(
		@Self() self: UserEntity,
		@Body() body: LoginRequestDTO,
		@Res({ passthrough: true }) res: Response,
	): Promise<LoginResponseDTO> {
		if (self) return { loginToken: null };
		const [authToken, requireTotp] = await this.authService.authenticateUser(body);
		if (requireTotp) {
			return { loginToken: authToken };
		}
		res.cookie(SESSION_COOKIE, authToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 315576000000, //100Y
		});
		return { loginToken: null };
	}

	@Public()
	@Post("register")
	async register(@Body() body: CreateUserDTO) {
		await this.authService.register(body);
	}

	@Get("/totp")
	async hasTotpEnabled(@Self() self: UserEntity): Promise<TotpStatusResponseDTO> {
		const status = await this.authService.getTotpStatus(self);
		if (status === null) return { totpState: "disabled" };
		return { totpState: status ? "enabled" : "needs_validation" };
	}

	@Post("totp/create")
	@HttpCode(HttpStatus.OK)
	async enableTotp(@Self() self: UserEntity) {
		await this.authService.createTotpForUser(self);
	}

	@Get("/totp/create")
	async getTotpUriForVerification(@Self() self: UserEntity): Promise<string> {
		return await this.authService.getUnverifiedTotpUriForUser(self);
	}

	@Post("totp/activate")
	@HttpCode(HttpStatus.OK)
	async activateTotp(@Self() self: UserEntity, @Body() body: OneTimeCodeRequestDTO) {
		await this.authService.activateTotpForUser(self, body.code);
	}

	@Public()
	@Post("login/2fa")
	async testTotp(@Body() body: LoginCodeRequestDTO, @Res({ passthrough: true }) res: Response) {
		const sessionId = await this.authService.authenticateUserWithTotpCode(body.token, body.code);
		res.cookie(SESSION_COOKIE, sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 315576000000, //100Y
		});
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

	@Delete("destroy")
	async destroyAll(@Self() user: UserEntity, @Res({ passthrough: true }) res: Response) {
		await this.authService.destroyAllSessions(user);
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
