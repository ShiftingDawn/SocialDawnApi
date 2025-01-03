import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user/user.entity";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { Session } from "./auth/session.entity";
import { FriendModule } from "./friend/friend.module";
import { FriendRequest } from "./friend/friendrequest.entity";
import { FriendEntity } from "./friend/friend.entity";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { DmModule } from "./dm/dm.module";
import { Dm } from "./dm/dm.entity";
import { DmMessage } from "./dm/dmmessage.entity";
import { AppGateway } from "./app.gateway";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { AuthRefreshMiddleware } from "@/auth/auth.middleware";

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: "postgres",
			host: "localhost",
			port: 5432,
			username: "socialdawn",
			password: "socialdawn",
			database: "socialdawn",
			entities: [UserEntity, Session, FriendRequest, FriendEntity, Dm, DmMessage],
			synchronize: process.env.NODE_ENV === "development",
			namingStrategy: new SnakeNamingStrategy(),
		}),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: true,
			playground: false,
			includeStacktraceInErrorResponses: process.env.NODE_ENV === "development",
		}),
		AuthModule,
		UserModule,
		FriendModule,
		DmModule,
	],
	controllers: [AppController],
	providers: [AppService, AppGateway],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthRefreshMiddleware).forRoutes("*");
	}
}
