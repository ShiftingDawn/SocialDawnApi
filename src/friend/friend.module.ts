import { Module } from "@nestjs/common";
import { FriendService } from "./friend.service";
import { FriendController } from "./friend.controller";
import { UserModule } from "../user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendRequest } from "./friendrequest.entity";
import { Friend } from "./friend.entity";

@Module({
	imports: [UserModule, TypeOrmModule.forFeature([FriendRequest, Friend])],
	providers: [FriendService],
	controllers: [FriendController],
})
export class FriendModule {}
