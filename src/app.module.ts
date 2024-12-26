import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/user.entity";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { Session } from "./auth/session.entity";
import { FriendModule } from "./friend/friend.module";
import { FriendRequest } from "./friend/friendrequest.entity";
import { Friend } from "./friend/friend.entity";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: "postgres",
			host: "localhost",
			port: 5432,
			username: "socialdawn",
			password: "socialdawn",
			database: "socialdawn",
			entities: [User, Session, FriendRequest, Friend],
			synchronize: process.env.NODE_ENV !== "production",
			namingStrategy: new SnakeNamingStrategy(),
		}),
		AuthModule,
		UserModule,
		FriendModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
