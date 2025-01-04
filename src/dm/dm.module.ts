import { Module } from "@nestjs/common";
import { DmService } from "./dm.service";
import { FriendModule } from "@/friend/friend.module";
import { UserModule } from "@/user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DmEntity, DmMessageEntity } from "./dm.entity";
import { DmResolver } from "./dm.resolver";

@Module({
	imports: [FriendModule, UserModule, TypeOrmModule.forFeature([DmEntity, DmMessageEntity])],
	providers: [DmService, DmResolver],
	exports: [DmService],
})
export class DmModule {}
