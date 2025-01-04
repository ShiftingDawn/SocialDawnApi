import { Module } from "@nestjs/common";
import { UserModule } from "@/user/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "./session.entity";
import { TotpEntity } from "@/auth/totp.entity";

@Module({
	imports: [UserModule, TypeOrmModule.forFeature([Session, TotpEntity])],
	providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
