import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { FriendService } from "./friend.service";
import { Self } from "@/self.decorator";
import { UserEntity } from "@/user/user.entity";
import { AddFriendDTO } from "@/friend/friend.req-dto";

@Controller("friend")
export class FriendController {
	constructor(private readonly friendService: FriendService) {}

	@Post()
	async addFriend(@Self() self: UserEntity, @Body() body: AddFriendDTO) {
		await this.friendService.addFriend(self, body);
	}

	@Post("/request/:id")
	acceptFriendRequest(@Self() self: UserEntity, @Param("id") id: string) {
		return this.friendService.acceptFriendRequest(self, id);
	}

	@Delete("/request/:id")
	deleteFriendRequest(@Self() self: UserEntity, @Param("id") id: string) {
		return this.friendService.deleteFriendRequest(self, id);
	}
}
