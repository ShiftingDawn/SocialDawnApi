import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { FriendRequestEntity } from "./friendrequest.entity";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FriendEntity } from "./friend.entity";
import { UserService } from "@/user/user.service";
import { UserEntity } from "@/user/user.entity";
import { oneOf, wrap } from "@/utils";
import { AddFriendDTO } from "@/friend/friend.req-dto";
import { Friend, FriendRequest, FriendRequestList } from "@/friend/friend.graphql";
import { DmEntity } from "@/dm/dm.entity";
import { DmService } from "@/dm/dm.service";

@Injectable()
export class FriendService {
	constructor(
		private readonly userService: UserService,
		private readonly dmService: DmService,
		private readonly dataSource: DataSource,
		@InjectRepository(FriendRequestEntity)
		private readonly friendRequestRepository: Repository<FriendRequestEntity>,
		@InjectRepository(FriendEntity)
		private readonly friendRepository: Repository<FriendEntity>,
	) {}

	map(entity: FriendEntity, existingUser: UserEntity): Friend {
		return {
			id: entity.friendId,
			since: entity.createdAt,
			user: wrap(this.userService.map(oneOf(entity.user1, entity.user2, "userId", existingUser.userId))),
			dm: wrap(this.dmService.map(entity.dm)),
		};
	}

	async getFriends(user: UserEntity): Promise<Friend[]> {
		const friends = await this.friendRepository.find({
			where: [{ user1: user }, { user2: user }],
			relations: ["user1", "user2", "dm"],
		});
		return friends.map((friend) => this.map(friend, user));
	}

	async getFriend(user: UserEntity, friendId: string): Promise<Friend> {
		const entity = await this.friendRepository.findOne({
			where: [
				{ friendId, user1: user },
				{ friendId, user2: user },
			],
			relations: ["user1", "user2", "dm"],
		});
		if (!entity) throw new NotFoundException();
		return this.map(entity, user);
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
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const dm = queryRunner.manager.create(DmEntity, {});
			await queryRunner.manager.save(dm);
			const friend = queryRunner.manager.create(FriendEntity, {
				user1: result.receiver,
				user2: result.sender,
				dm,
			});
			await queryRunner.manager.save(friend);
			await queryRunner.manager
				.createQueryBuilder(queryRunner)
				.delete()
				.from(FriendRequestEntity)
				.where("id = :id", { id })
				.andWhere("(sender_id = :userId OR receiver_id = :userId)", { userId: user.userId })
				.execute();
			await queryRunner.commitTransaction();
		} catch {
			await queryRunner.rollbackTransaction();
			throw new InternalServerErrorException();
		} finally {
			await queryRunner.release();
		}
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
