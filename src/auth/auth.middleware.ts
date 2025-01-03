import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE } from "@/constants";
import { AuthService } from "@/auth/auth.service";

@Injectable()
export class AuthRefreshMiddleware implements NestMiddleware {
	constructor(private readonly authService: AuthService) {}

	async use(req: Request, res: Response, next: NextFunction) {
		if (SESSION_COOKIE in req.cookies) {
			const sessionId: string = req.cookies[SESSION_COOKIE];
			try {
				await this.authService.updateSession(sessionId);
			} catch {
				delete req.cookies[SESSION_COOKIE];
				res.clearCookie(SESSION_COOKIE);
			}
		}
		next();
	}
}
