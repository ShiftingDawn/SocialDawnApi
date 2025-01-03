import { forwardRef, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";
import { UserResolver } from "./user.resolver";
import { FriendModule } from "@/friend/friend.module";

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity]), forwardRef(() => FriendModule)],
	providers: [UserService, UserResolver],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
