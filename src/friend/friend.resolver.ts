import { Query, Resolver } from "@nestjs/graphql";
import { Friend, FriendRequestList } from "@/friend/friend.graphql";
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

	@Query(() => [Friend], { name: "friend" })
	getFriends(@Self() self: UserEntity): Promise<Friend[]> {
		return this.friendsService.getFriends(self);
	}

	@Query(() => FriendRequestList, { name: "friendRequest" })
	getFriendRequests(@Self() self: UserEntity): Promise<FriendRequestList> {
		return this.friendsService.getFriendRequests(self);
	}
}
