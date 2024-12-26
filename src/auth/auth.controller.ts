import { Body, Controller, Get, Post, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./login.dto";
import { AuthGuard } from "./auth.guard";
import { Public } from "../public";
import { Cookies } from "../cookies.decorator";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	async login(@Body() body: LoginDTO, @Res({ passthrough: true }) res: Response) {
		const [accessToken, refreshToken] = await this.authService.login(body);
		res.cookie("rtk", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 315576000000, //100Y
		});
		return { accessToken };
	}

	@Public()
	@Post("refresh")
	async refresh(@Cookies("rtk") refreshToken: string, @Res({ passthrough: true }) res: Response) {
		if (!refreshToken) {
			throw new UnauthorizedException();
		}
		try {
			const [accessToken, newRefreshToken] = await this.authService.refreshTokens(refreshToken);
			res.cookie("rtk", newRefreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 315576000000, //100Y
			});
			return { accessToken };
		} catch (error) {
			res.clearCookie("rtk");
			throw error;
		}
	}

	@UseGuards(AuthGuard)
	@Get("test")
	testAuth() {}
}
