import { Injectable, NotFoundException } from "@nestjs/common";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { FriendService } from "../friend/friend.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Dm } from "./dm.entity";
import { LessThan, Repository } from "typeorm";
import { DmMessage } from "./dmmessage.entity";
import { DmDTO } from "./dm.dto";
import { DmMessageDTO } from "./dmmessage.dto";
import { getGravatarLink } from "../utils";

@Injectable()
export class DmService {
	constructor(
		private readonly userService: UserService,
		private readonly friendService: FriendService,
		@InjectRepository(Dm)
		private readonly dmRepository: Repository<Dm>,
		@InjectRepository(DmMessage)
		private readonly dmMessageRepository: Repository<DmMessage>,
	) {}

	getDmByUserAndId(user: UserEntity, dmId: string): Promise<Dm | null> {
		return this.dmRepository.findOne({
			where: [
				{ dmId, user1: user },
				{ dmId, user2: user },
			],
			relations: ["user1", "user2"],
		});
	}

	getExistingDms(user: UserEntity) {
		return this.dmRepository.find({
			where: [{ user1: user }, { user2: user }],
			relations: ["user1", "user2"],
		});
	}

	async getFriendDm(user: UserEntity, friendId: string): Promise<DmDTO> {
		const friend = await this.friendService.getFriend(user, friendId);
		if (!friend) {
			throw new NotFoundException();
		}
		const friendUser = await this.userService.getUserById(friendId);
		if (!friendUser) {
			throw new NotFoundException();
		}
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
			dmId: dm.dmId,
			name: friendUser.username,
			thumbnail: getGravatarLink(friendUser.email),
		};
	}

	async addMessageToDm(user: UserEntity, dmId: string, message: string): Promise<DmMessage> {
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

	async getMessagesForDm(user: UserEntity, dmId: string, last: string, take: number): Promise<DmMessageDTO[]> {
		const dm = await this.dmRepository.findOneBy([
			{ dmId, user1: user },
			{ dmId, user2: user },
		]);
		if (!dm) {
			throw new NotFoundException();
		}
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
			messageId: msg.messageId,
			username: msg.sender.username,
			responseTo: null,
			sendAt: msg.sentAt.getTime(),
			message: msg.message,
		}));
	}
}
