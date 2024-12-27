import { Module } from "@nestjs/common";
import { DmController } from "./dm.controller";
import { DmService } from "./dm.service";
import { FriendModule } from "../friend/friend.module";
import { UserModule } from "../user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Dm } from "./dm.entity";
import { DmMessage } from "./dmmessage.entity";

@Module({
	imports: [FriendModule, UserModule, TypeOrmModule.forFeature([Dm, DmMessage])],
	controllers: [DmController],
	providers: [DmService],
})
export class DmModule {}
