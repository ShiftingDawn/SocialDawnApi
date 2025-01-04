import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Dm, DmMessage } from "@/dm/dm.graphql";
import { DmService } from "@/dm/dm.service";
import { Self } from "@/self.decorator";
import { UserEntity } from "@/user/user.entity";

@Resolver(() => Dm)
export class DmResolver {
	constructor(private readonly dmService: DmService) {}

	@Query(() => [Dm], { name: "dms" })
	getDms(@Self() self: UserEntity): Promise<Dm[]> {
		return this.dmService.getDms(self);
	}

	@Query(() => Dm, { name: "dm" })
	getDm(@Self() self: UserEntity, @Args("dmId") dmId: string): Promise<Dm> {
		return this.dmService.getDm(self, dmId);
	}

	@Query(() => [DmMessage], { name: "dmMessages" })
	getDmMessages(
		@Self() self: UserEntity,
		@Args("dmId") dmId: string,
		@Args("last", { nullable: true, type: () => String }) last: string | null,
		@Args("take", { type: () => Int }) take: number,
	): Promise<DmMessage[]> {
		return this.dmService.getMessagesForDm(self, dmId, last, take);
	}

	@Mutation(() => Dm, { name: "openFriendDm" })
	openFriendDm(@Self() self: UserEntity, @Args("friendId") friendId: string): Promise<Dm> {
		return this.dmService.makeFriendDm(self, friendId);
	}
}
