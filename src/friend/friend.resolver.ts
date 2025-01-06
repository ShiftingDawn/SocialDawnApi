import { Args, Query, Resolver } from "@nestjs/graphql";
import { Friend, FriendRequestList } from "@/friend/friend.graphql";
import { FriendService } from "@/friend/friend.service";
import { Self } from "@/self.decorator";
import { UserEntity } from "@/user/user.entity";

@Resolver(() => Friend)
export class FriendResolver {
	constructor(private readonly friendsService: FriendService) {}

	@Query(() => [Friend], { name: "friends" })
	getFriends(@Self() self: UserEntity): Promise<Friend[]> {
		return this.friendsService.getFriends(self);
	}

	@Query(() => Friend, { name: "friend" })
	getFriend(@Self() self: UserEntity, @Args("friendId", { type: () => String }) friendId: string): Promise<Friend> {
		return this.friendsService.getFriend(self, friendId);
	}

	@Query(() => FriendRequestList, { name: "friendRequest" })
	getFriendRequests(@Self() self: UserEntity): Promise<FriendRequestList> {
		return this.friendsService.getFriendRequests(self);
	}
}
