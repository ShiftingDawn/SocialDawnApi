import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { jwtSecret } from "./auth.module";
import { IS_PUBLIC_KEY } from "../public";
import { UserService } from "../user/user.service";
import { Socket } from "socket.io";
import { User } from "../user/user.entity";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
			return true;
		}
		const token = this.extractToken(context);
		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: jwtSecret,
			});
			this.setUser(context, await this.userService.getUserById(payload.sub));
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}

	private extractToken(context: ExecutionContext): string | undefined {
		switch (context.getType()) {
			case "http":
				return this.extractTokenHttp(context.switchToHttp().getRequest());
			case "ws":
				return this.extractTokenWs(context.switchToWs().getClient<Socket>());
		}
	}

	private setUser(context: ExecutionContext, user: User | null) {
		if (!user) return;
		switch (context.getType()) {
			case "http":
				context.switchToHttp().getRequest().user = user;
				break;
			case "ws":
				context.switchToWs().getClient().user = user;
				break;
		}
	}

	private extractTokenHttp(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(" ") ?? [];
		return type === "Bearer" ? token : undefined;
	}

	private extractTokenWs(client: Socket): string | undefined {
		const [type, token] = client.handshake.headers.authorization?.split(" ") ?? [];
		return type === "Bearer" ? token : undefined;
	}
}
