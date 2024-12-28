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
			where: [{ user1: user }, { user2: user }],
			relations: ["user1", "user2"],
		});
		//TODO handle onlineOnly
		return friends.map((friend) => {
			const friendUser = user.userId === friend.user1.userId ? friend.user2 : friend.user1;
			return {
				friendId: friendUser.userId,
				username: friendUser.username,
				thumbnail: getGravatarLink(friendUser.email),
				friendsSince: friend.createdAt.getTime(),
			};
		});
	}

	getFriend(user: User, friendId: string) {
		return this.friendRepository.findOneBy([
			{ user1: user, user2: { userId: friendId } },
			{ user1: { userId: friendId }, user2: user },
		]);
	}

	async addFriend(self: User, data: AddFriendDTO) {
		const foundUser = await this.userService.getUserByUsername(data.username);
		if (!foundUser) {
			throw new BadRequestException("invalid_username");
		}
		if (await this.friendRepository.findOneBy({ user1: self, user2: foundUser })) {
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

	async getReceivedFriendRequestCount(user: User) {
		return await this.friendRequestRepository.countBy({ receiver: user });
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
			user1: result.receiver,
			user2: result.sender,
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

	async getSentFriendRequestCount(user: User) {
		return await this.friendRequestRepository.countBy({ sender: user });
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
