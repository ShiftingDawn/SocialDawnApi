import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FriendRequestEntity } from "./friendrequest.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FriendEntity } from "./friend.entity";
import { UserService } from "@/user/user.service";
import { UserEntity } from "@/user/user.entity";
import { oneOf, wrap } from "@/utils";
import { AddFriendDTO } from "@/friend/friend.req-dto";
import { Friend, FriendRequest, FriendRequestList } from "@/friend/friend.graphql";

@Injectable()
export class FriendService {
	constructor(
		private readonly userService: UserService,
		@InjectRepository(FriendRequestEntity)
		private readonly friendRequestRepository: Repository<FriendRequestEntity>,
		@InjectRepository(FriendEntity)
		private readonly friendRepository: Repository<FriendEntity>,
	) {}

	async getFriends(user: UserEntity): Promise<Friend[]> {
		const friends = await this.friendRepository.find({
			where: [{ user1: user }, { user2: user }],
			relations: ["user1", "user2"],
		});
		return friends.map((friend) => {
			const result = new Friend();
			result.id = friend.friendId;
			result.since = friend.createdAt;
			result.user = wrap(this.userService.map(oneOf(friend.user1, friend.user2, "userId", user.userId)));
			return result;
		});
	}

	getFriend(user: UserEntity, friendId: string) {
		return this.friendRepository.findOne({
			where: [
				{ friendId, user1: user },
				{ friendId, user2: user },
			],
			relations: ["user1", "user2"],
		});
	}

	async addFriend(self: UserEntity, data: AddFriendDTO) {
		const foundUser = await this.userService.findOneBy({ username: data.username });
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

	async getFriendRequestsOfType(user: UserEntity, type: "sent" | "received"): Promise<FriendRequest[]> {
		const entities = await this.friendRequestRepository.find({
			where: type === "sent" ? { sender: user } : { receiver: user },
			relations: [type === "sent" ? "receiver" : "sender"],
			order: { createdAt: "DESC" },
		});
		return entities.map((entity) => ({
			id: entity.friendRequestId,
			sentAt: entity.createdAt,
			user: wrap(this.userService.map(oneOf(entity.sender, entity.receiver, "userId", user.userId))),
		}));
	}

	async getFriendRequests(user: UserEntity): Promise<FriendRequestList> {
		return {
			sent: this.getFriendRequestsOfType(user, "sent"),
			received: this.getFriendRequestsOfType(user, "received"),
		};
	}

	async acceptFriendRequest(user: UserEntity, id: string) {
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
		await this.deleteFriendRequest(user, id);
	}

	async deleteFriendRequest(user: UserEntity, id: string) {
		const result = await this.friendRequestRepository
			.createQueryBuilder()
			.delete()
			.from(FriendRequestEntity)
			.where("id = :id", { id })
			.andWhere("(sender_id = :userId OR receiver_id = :userId)", { userId: user.userId })
			.execute();
		if (result.affected === 0) throw new NotFoundException();
	}
}
