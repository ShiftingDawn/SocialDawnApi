import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FriendRequest } from "./friendrequest.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AddFriendDTO } from "./addfriend.dto";
import { Friend } from "./friend.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/user.entity";
import { FriendRequestResponseDTO } from "./friendrequest.dto";
import { request } from "express";

@Injectable()
export class FriendService {
	constructor(
		private readonly userService: UserService,
		@InjectRepository(FriendRequest)
		private readonly friendRequestRepository: Repository<FriendRequest>,
		@InjectRepository(Friend)
		private readonly friendRepository: Repository<Friend>,
	) {}

	async addFriend(self: User, data: AddFriendDTO) {
		const foundUser = await this.userService.getUserByUsername(data.username);
		if (!foundUser) {
			throw new BadRequestException("invalid_username");
		}
		if (await this.friendRepository.findOneBy({ owner: self, friend: foundUser })) {
			throw new BadRequestException("already_friends");
		}
		if (await this.friendRequestRepository.findOneBy({ sender: self, receiver: foundUser })) {
			throw new BadRequestException("already_requested");
		}
		const request = this.friendRequestRepository.create({ sender: self, receiver: foundUser });
		await this.friendRequestRepository.save(request);
	}

	async getSentFriendRequests(user: User): Promise<FriendRequestResponseDTO[]> {
		const requests = await this.friendRequestRepository.find({
			where: { sender: user },
			relations: ["receiver"],
			order: { createdAt: "DESC" },
		});
		return requests.map((req) => ({
			id: req.friendRequestId,
			username: req.receiver.username,
			sentAt: req.createdAt.getTime(),
		}));
	}

	async deleteFriendRequests(user: User, id: string) {
		const result = await this.friendRequestRepository.delete({
			friendRequestId: id,
			sender: user,
		});
		if (result.affected === 0) {
			throw new NotFoundException();
		}
	}
}
