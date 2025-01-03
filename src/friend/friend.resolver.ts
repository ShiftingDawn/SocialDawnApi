import { Query, Resolver } from "@nestjs/graphql";
import { Friend } from "@/friend/friend.graphql";
import { UserService } from "@/user/user.service";
import { FriendService } from "@/friend/friend.service";
import { Self } from "@/self.decorator";
import { UserEntity } from "@/user/user.entity";

@Resolver(() => Friend)
export class FriendResolver {
	constructor(
		private readonly friendsService: FriendService,
		private readonly userService: UserService,
	) {}

	@Query(() => [Friend], { name: "friends" })
	async getFriends(@Self() self: UserEntity): Promise<Friend[]> {
		return this.friendsService.getFriends(self);
	}
}
