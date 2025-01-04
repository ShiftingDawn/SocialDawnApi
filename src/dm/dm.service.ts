import { Injectable, NotFoundException } from "@nestjs/common";
import { UserEntity } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
import { FriendService } from "@/friend/friend.service";
import { InjectRepository } from "@nestjs/typeorm";
import { DmEntity, DmMessageEntity } from "./dm.entity";
import { LessThan, Repository } from "typeorm";
import { oneOf, wrap } from "@/utils";
import { Dm, DmMessage } from "@/dm/dm.graphql";

@Injectable()
export class DmService {
	constructor(
		private readonly userService: UserService,
		private readonly friendService: FriendService,
		@InjectRepository(DmEntity)
		private readonly dmRepository: Repository<DmEntity>,
		@InjectRepository(DmMessageEntity)
		private readonly dmMessageRepository: Repository<DmMessageEntity>,
	) {}

	async getDms(user: UserEntity): Promise<Dm[]> {
		const entities = await this.dmRepository.find({
			where: [{ user1: user }, { user2: user }],
			relations: ["user1", "user2"],
		});
		return entities.map((entity) => {
			const dmUser = entity.user1.userId === user.userId ? entity.user2 : entity.user1;
			return {
				id: entity.dmId,
				user: wrap(this.userService.map(dmUser)!),
				messages: this.getMessagesForDm(user, entity.dmId, null, 50),
			};
		});
	}

	async getDm(user: UserEntity, dmId: string): Promise<Dm> {
		const result = await this.dmRepository.findOne({
			where: [
				{ dmId: dmId, user1: user },
				{ dmId: dmId, user2: user },
			],
			relations: ["user1", "user2"],
		});
		if (!result) throw new NotFoundException();
		return {
			id: result.dmId,
			user: wrap(this.userService.map(oneOf(result.user1, result.user2, "userId", user.userId))),
			messages: this.getMessagesForDm(user, result.dmId, null, 50),
		};
	}

	getDmByUserAndId(user: UserEntity, dmId: string): Promise<DmEntity | null> {
		return this.dmRepository.findOne({
			where: [
				{ dmId, user1: user },
				{ dmId, user2: user },
			],
			relations: ["user1", "user2"],
		});
	}

	async makeFriendDm(user: UserEntity, friendId: string): Promise<Dm> {
		const friend = await this.friendService.getFriend(user, friendId);
		if (!friend) throw new NotFoundException();
		const friendUser = oneOf(friend.user1, friend.user2, "userId", user.userId);
		let dm = await this.dmRepository.findOneBy([
			{ user1: user, user2: friendUser },
			{ user1: friendUser, user2: user },
		]);
		if (dm === null) {
			dm = this.dmRepository.create({
				user1: user,
				user2: friendUser,
			});
			await this.dmRepository.save(dm);
		}
		return {
			id: dm.dmId,
			user: wrap(this.userService.map(friendUser)),
			messages: this.getMessages(dm, null, 10),
		};
	}

	async addMessageToDm(user: UserEntity, dmId: string, message: string): Promise<DmMessageEntity> {
		const dm = await this.getDmByUserAndId(user, dmId);
		if (!dm) {
			throw new NotFoundException();
		}
		const msg = this.dmMessageRepository.create({
			dm,
			sender: user,
			message,
		});
		await this.dmMessageRepository.save(msg);
		return msg;
	}

	async getMessages(dm: DmEntity, last: string | null, take: number): Promise<DmMessage[]> {
		let messages;
		if (!last) {
			messages = await this.dmMessageRepository.find({
				where: { dm },
				relations: ["sender"],
				order: { sentAt: "DESC" },
				take: take > 0 ? take : 50,
			});
		} else {
			const lastMsg = await this.dmMessageRepository.findOneBy({ dm });
			if (!lastMsg) {
				throw new NotFoundException();
			}
			messages = await this.dmMessageRepository.find({
				where: { dm, sentAt: LessThan(lastMsg.sentAt) },
				relations: ["sender"],
				order: { sentAt: "DESC" },
				take: take > 0 ? take : 50,
			});
		}
		return messages.map((msg) => ({
			id: msg.messageId,
			sender: wrap(this.userService.map(msg.sender)),
			responseTo: null,
			sentAt: msg.sentAt,
			content: msg.message,
		}));
	}

	async getMessagesForDm(user: UserEntity, dmId: string, last: string | null, take: number): Promise<DmMessage[]> {
		const dm = await this.dmRepository.findOneBy([
			{ dmId, user1: user },
			{ dmId, user2: user },
		]);
		if (!dm) throw new NotFoundException();
		return await this.getMessages(dm, last, take);
	}
}
