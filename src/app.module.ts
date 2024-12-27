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
import { DmModule } from "./dm/dm.module";
import { Dm } from "./dm/dm.entity";
import { DmMessage } from "./dm/dmmessage.entity";

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: "postgres",
			host: "localhost",
			port: 5432,
			username: "socialdawn",
			password: "socialdawn",
			database: "socialdawn",
			entities: [User, Session, FriendRequest, Friend, Dm, DmMessage],
			synchronize: process.env.NODE_ENV !== "production",
			namingStrategy: new SnakeNamingStrategy(),
		}),
		AuthModule,
		UserModule,
		FriendModule,
		DmModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
