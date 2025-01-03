import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "@/public";
import { Socket } from "socket.io";
import { UserEntity } from "@/user/user.entity";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthService } from "@/auth/auth.service";
import { SESSION_COOKIE } from "@/constants";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
			return true;
		}
		const sessionId = this.extractSessionId(context);
		if (!sessionId) {
			throw new UnauthorizedException();
		}
		const session = await this.authService.getSessionById(sessionId);
		if (!session) {
			throw new UnauthorizedException();
		}

		this.setUser(context, session?.user);
		return true;
	}

	private extractSessionId(context: ExecutionContext): string | undefined {
		switch (context.getType() as string) {
			case "http":
				return this.extractSessionIdHttp(context.switchToHttp().getRequest());
			case "ws":
				return this.extractSessionIdWs(context.switchToWs().getClient<Socket>());
			case "graphql":
				return this.extractSessionIdGraphQl(GqlExecutionContext.create(context));
		}
	}

	private setUser(context: ExecutionContext, user: UserEntity | null) {
		if (!user) return;
		switch (context.getType() as string) {
			case "http":
				context.switchToHttp().getRequest().user = user;
				break;
			case "ws":
				context.switchToWs().getClient().user = user;
				break;
			case "graphql":
				GqlExecutionContext.create(context).getArgByIndex(2).req.user = user;
				break;
		}
	}

	private extractSessionIdHttp(request: Request): string | undefined {
		return request.cookies[SESSION_COOKIE];
	}

	private extractSessionIdWs(client: Socket): string | undefined {
		const cookie = client.handshake.headers.cookie;
		if (!cookie) return undefined;
		const cookies = cookie.split(";");
		const sessionCookie = cookies.find((c) => c.indexOf(`${SESSION_COOKIE}=`) === 0);
		if (!sessionCookie) return undefined;
		return sessionCookie.substring(`${SESSION_COOKIE}=`.length);
	}

	private extractSessionIdGraphQl(gql: GqlExecutionContext): string | undefined {
		const request: Request = gql.getArgByIndex(2).req;
		return this.extractSessionIdHttp(request);
	}
}
