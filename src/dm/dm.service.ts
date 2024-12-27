import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { FriendService } from "../friend/friend.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Dm } from "./dm.entity";
import { Repository } from "typeorm";
import { DmMessage } from "./dmmessage.entity";
import { DmDTO } from "./dm.dto";
import { DmMessageDTO } from "./dmmessage.dto";

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

	async getFriendDm(user: User, friendId: string): Promise<DmDTO> {
		const friend = await this.friendService.getFriend(user, friendId);
		if (!friend) {
			throw new NotFoundException();
		}
		const friendUser = await this.userService.getUserById(friendId);
		if (!friendUser) {
			throw new NotFoundException();
		}
		let dm = await this.dmRepository.findOneBy({
			owner: user,
			recipient: friendUser,
			isGroupChat: false,
		});
		if (dm === null) {
			dm = this.dmRepository.create({
				owner: user,
				recipient: friendUser,
				isGroupChat: false,
			});
			await this.dmRepository.save(dm);
		}
		return {
			dmId: dm.dmId,
		};
	}

	async getMessagesForDm(user: User, dmId: string, last: string, take: number): Promise<DmMessageDTO[]> {
		const dm = await this.dmRepository.findOneBy({ dmId, owner: user });
		if (!dm) {
			throw new NotFoundException();
		}
		const messages = await this.dmMessageRepository.find({
			where: { dm },
			relations: ["sender"],
			order: { sentAt: "DESC" },
			skip: 0, //TODO fix
			take: take > 0 ? take : 50,
		});
		return messages.map((msg) => ({
			messageId: msg.messageId,
			username: msg.sender.username,
			responseTo: null,
			sendAt: msg.sentAt.getTime(),
			message: msg.message,
		}));
	}
}
