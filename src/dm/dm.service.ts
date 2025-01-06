import { Injectable, NotFoundException } from "@nestjs/common";
import { UserEntity } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { DmEntity, DmMessageEntity } from "./dm.entity";
import { LessThan, Repository } from "typeorm";
import { wrap } from "@/utils";
import { Dm, DmMessage } from "@/dm/dm.graphql";

@Injectable()
export class DmService {
	constructor(
		private readonly userService: UserService,
		@InjectRepository(DmEntity)
		private readonly dmRepository: Repository<DmEntity>,
		@InjectRepository(DmMessageEntity)
		private readonly dmMessageRepository: Repository<DmMessageEntity>,
	) {}

	map(entity: DmEntity): Dm {
		return {
			id: entity.dmId,
			lastUpdate: entity.lastUpdate,
			messages: this.getMessages(entity, null, 50),
		};
	}

	mapMessage(entity: DmMessageEntity): DmMessage {
		return {
			id: entity.messageId,
			sender: wrap(this.userService.map(entity.sender)),
			responseTo: null,
			sentAt: entity.sentAt,
			content: entity.message,
		};
	}

	getDmByUserAndId(user: UserEntity, dmId: string): Promise<DmEntity | null> {
		return this.dmRepository.findOne({
			where: [
				{ dmId, owningFriend: { user1: user } },
				{ dmId, owningFriend: { user2: user } },
			],
			relations: ["owningFriend"],
		});
	}

	async addMessageToDm(user: UserEntity, dmId: string, message: string): Promise<DmMessageEntity> {
		const dm = await this.getDmByUserAndId(user, dmId);
		if (!dm) throw new NotFoundException();
		const msg = this.dmMessageRepository.create({
			dm,
			sender: user,
			message,
		});
		await this.dmMessageRepository.save(msg);
		dm.lastUpdate = msg.sentAt;
		await this.dmRepository.save(dm);
		return msg;
	}

	async getMessages(dm: DmEntity, last: string | null, take: number): Promise<DmMessage[]> {
		if (!last) {
			const messages = await this.dmMessageRepository.find({
				where: { dm: { dmId: dm.dmId } },
				relations: ["sender"],
				order: { sentAt: "DESC" },
				take: take > 0 ? take : 50,
				cache: false,
			});
			return messages.map((msg) => this.mapMessage(msg));
		} else {
			const lastMsg = await this.dmMessageRepository.findOneBy({ dm });
			if (!lastMsg) {
				throw new NotFoundException();
			}
			const messages = await this.dmMessageRepository.find({
				where: { dm, sentAt: LessThan(lastMsg.sentAt) },
				relations: ["sender"],
				order: { sentAt: "DESC" },
				take: take > 0 ? take : 50,
			});
			return messages.map((msg) => this.mapMessage(msg));
		}
	}

	async getMessagesForDm(user: UserEntity, dmId: string, last: string | null, take: number): Promise<DmMessage[]> {
		const dm = await this.getDmByUserAndId(user, dmId);
		if (!dm) throw new NotFoundException();
		return this.getMessages(dm, last, take);
	}
}
