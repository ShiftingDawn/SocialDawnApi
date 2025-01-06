import { forwardRef, Module } from "@nestjs/common";
import { DmService } from "./dm.service";
import { UserModule } from "@/user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DmEntity, DmMessageEntity } from "./dm.entity";
import { DmResolver } from "./dm.resolver";

@Module({
	imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([DmEntity, DmMessageEntity])],
	providers: [DmService, DmResolver],
	exports: [DmService],
})
export class DmModule {}
