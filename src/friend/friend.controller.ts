import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { FriendService } from "./friend.service";
import { Self } from "../user/self.decorator";
import { User } from "../user/user.entity";
import { AddFriendDTO } from "./addfriend.dto";

@Controller("friend")
export class FriendController {
	constructor(private readonly friendService: FriendService) {}

	@Post()
	async addFriend(@Self() self: User, @Body() body: AddFriendDTO) {
		await this.friendService.addFriend(self, body);
	}

	@Get("/request")
	getSentRequests(@Self() self: User) {
		return this.friendService.getSentFriendRequests(self);
	}

	@Delete("/request/:id")
	deleteRequest(@Self() self: User, @Param("id") id: string) {
		return this.friendService.deleteFriendRequests(self, id);
	}
}
