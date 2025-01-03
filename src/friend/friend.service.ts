import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FriendRequest } from "./friendrequest.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FriendEntity } from "./friend.entity";
import { UserService } from "@/user/user.service";
import { UserEntity } from "@/user/user.entity";
import { getGravatarLink } from "@/utils";
import { FriendDTO, FriendRequestResponseDTO } from "@/friend/friend.res-dto";
import { AddFriendDTO } from "@/friend/friend.req-dto";
import { Friend } from "@/friend/friend.graphql";
import { User } from "@/user/user.graphql";

@Injectable()
export class FriendService {
	constructor(
		private readonly userService: UserService,
		@InjectRepository(FriendRequest)
		private readonly friendRequestRepository: Repository<FriendRequest>,
		@InjectRepository(FriendEntity)
		private readonly friendRepository: Repository<FriendEntity>,
	) {}

	async listFriends(user: UserEntity, onlineOnly: boolean): Promise<FriendDTO[]> {
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

	async getFriends(user: UserEntity): Promise<Friend[]> {
		const friends1 = await this.friendRepository.find({
			where: { user1: user },
			relations: ["user2"],
		});
		const friends2 = await this.friendRepository.find({
			where: { user2: user },
			relations: ["user1"],
		});
		return [...friends1, ...friends2].map((friend) => {
			const result = new Friend();
			result.id = friend.friendId;
			result.since = friend.createdAt;
			result.user = this.userService.getById(friend.user1?.userId ?? friend.user2.userId) as Promise<User>;
			return result;
		});
	}

	getFriend(user: UserEntity, friendId: string) {
		return this.friendRepository.findOneBy([
			{ user1: user, user2: { userId: friendId } },
			{ user1: { userId: friendId }, user2: user },
		]);
	}

	async addFriend(self: UserEntity, data: AddFriendDTO) {
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

	async getReceivedFriendRequests(user: UserEntity): Promise<FriendRequestResponseDTO[]> {
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

	async getReceivedFriendRequestCount(user: UserEntity) {
		return await this.friendRequestRepository.countBy({ receiver: user });
	}

	async deleteReceivedFriendRequest(user: UserEntity, id: string) {
		const result = await this.friendRequestRepository.delete({
			friendRequestId: id,
			receiver: user,
		});
		if (result.affected === 0) {
			throw new NotFoundException();
		}
	}

	async acceptReceivedFriendRequest(user: UserEntity, id: string) {
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

	async getSentFriendRequests(user: UserEntity): Promise<FriendRequestResponseDTO[]> {
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

	async getSentFriendRequestCount(user: UserEntity) {
		return await this.friendRequestRepository.countBy({ sender: user });
	}

	async deleteSentFriendRequest(user: UserEntity, id: string) {
		const result = await this.friendRequestRepository.delete({
			friendRequestId: id,
			sender: user,
		});
		if (result.affected === 0) {
			throw new NotFoundException();
		}
	}
}
