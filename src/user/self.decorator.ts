import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Self = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	switch (ctx.getType()) {
		case "http":
			return ctx.switchToHttp().getRequest().user;
		case "ws":
			return ctx.switchToWs().getClient().user;
	}
	return null;
});
