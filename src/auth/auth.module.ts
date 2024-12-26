import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "./session.entity";

export const jwtSecret = process.env.JWT_SECRET ?? " supersecret";

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([Session]),
		JwtModule.register({
			global: true,
			secret: jwtSecret,
			signOptions: { expiresIn: "1d" },
		}),
	],
	providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
