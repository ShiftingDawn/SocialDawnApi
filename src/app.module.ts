import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/user.entity";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { Session } from "./auth/session.entity";

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: "postgres",
			host: "localhost",
			port: 5432,
			username: "socialdawn",
			password: "socialdawn",
			database: "socialdawn",
			entities: [User, Session],
			synchronize: process.env.NODE_ENV !== "production",
		}),
		AuthModule,
		UserModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
