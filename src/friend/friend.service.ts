import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FriendRequest } from "./friendrequest.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AddFriendDTO } from "./addfriend.dto";
import { Friend } from "./friend.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/user.entity";
import { FriendRequestResponseDTO } from "./friendrequest.dto";
import { FriendDTO } from "./friend.dto";
import { getGravatarLink } from "../utils";

@Injectable()
export class FriendService {
	constructor(
		private readonly userService: UserService,
		@InjectRepository(FriendRequest)
		private readonly friendRequestRepository: Repository<FriendRequest>,
		@InjectRepository(Friend)
		private readonly friendRepository: Repository<Friend>,
	) {}

	async listFriends(user: User, onlineOnly: boolean): Promise<FriendDTO[]> {
		const friends = await this.friendRepository.find({
			where: { owner: user },
			relations: ["friend"],
		});
		//TODO handle onlineOnly
		return friends.map((friend) => ({
			friendId: friend.friend.userId,
			username: friend.friend.username,
			thumbnail: getGravatarLink(friend.friend.email),
			friendsSince: friend.createdAt.getTime(),
		}));
	}

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

	async getReceivedFriendRequests(user: User): Promise<FriendRequestResponseDTO[]> {
		const requests = await this.friendRequestRepository.find({
			where: { receiver: user },
			relations: ["sender"],
			order: { createdAt: "DESC" },
		});
		return requests.map((req) => ({
			id: req.friendRequestId,
			username: req.sender.username,
			sentAt: req.createdAt.getTime(),
		}));
	}

	async deleteReceivedFriendRequest(user: User, id: string) {
		const result = await this.friendRequestRepository.delete({
			friendRequestId: id,
			receiver: user,
		});
		if (result.affected === 0) {
			throw new NotFoundException();
		}
	}

	async acceptReceivedFriendRequest(user: User, id: string) {
		const result = await this.friendRequestRepository.findOne({
			where: {
				friendRequestId: id,
				receiver: user,
			},
			relations: ["sender", "receiver"],
		});
		if (!result) {
			throw new NotFoundException();
		}
		const friend = this.friendRepository.create({
			owner: result.receiver,
			friend: result.sender,
		});
		await this.friendRepository.save(friend);
		await this.deleteReceivedFriendRequest(user, id);
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

	async deleteSentFriendRequest(user: User, id: string) {
		const result = await this.friendRequestRepository.delete({
			friendRequestId: id,
			sender: user,
		});
		if (result.affected === 0) {
			throw new NotFoundException();
		}
	}
}
