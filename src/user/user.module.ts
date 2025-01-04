import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";
import { UserResolver } from "./user.resolver";
import { FriendModule } from "@/friend/friend.module";

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity]), forwardRef(() => FriendModule)],
	providers: [UserService, UserResolver],
	exports: [UserService],
})
export class UserModule {}
