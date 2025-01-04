import { forwardRef, Module } from "@nestjs/common";
import { FriendService } from "./friend.service";
import { FriendController } from "./friend.controller";
import { UserModule } from "@/user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendRequestEntity } from "./friendrequest.entity";
import { FriendEntity } from "./friend.entity";
import { FriendResolver } from "./friend.resolver";

@Module({
	imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([FriendRequestEntity, FriendEntity])],
	providers: [FriendService, FriendResolver],
	controllers: [FriendController],
	exports: [FriendService],
})
export class FriendModule {}
