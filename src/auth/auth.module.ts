import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";

export const jwtSecret = process.env.JWT_SECRET ?? " supersecret";

@Module({
	imports: [
		UserModule,
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
