import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const Self = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	switch (ctx.getType() as string) {
		case "http":
			return ctx.switchToHttp().getRequest().user;
		case "ws":
			return ctx.switchToWs().getClient().user;
		case "graphql":
			return GqlExecutionContext.create(ctx).getArgByIndex(2).req.user;
	}
	return null;
});
