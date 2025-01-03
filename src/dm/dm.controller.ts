import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { DmService } from "./dm.service";
import { Self } from "../self.decorator";
import { UserEntity } from "../user/user.entity";
import { DmDTO } from "./dm.dto";
import { getGravatarLink } from "../utils";

@Controller("dm")
export class DmController {
	constructor(private readonly dmService: DmService) {}

	@Get()
	async getExistingDms(@Self() self: UserEntity): Promise<DmDTO[]> {
		const dms = await this.dmService.getExistingDms(self);
		return dms.map((dm) => {
			const dmUser = dm.user1.userId === self.userId ? dm.user2 : dm.user1;
			return {
				dmId: dm.dmId,
				name: dmUser.username,
				thumbnail: getGravatarLink(dmUser.email),
			};
		});
	}

	@Get("/:id")
	async getDm(@Self() self: UserEntity, @Param("id") dmId: string): Promise<DmDTO> {
		const dm = await this.dmService.getDmByUserAndId(self, dmId);
		if (!dm) {
			throw new NotFoundException();
		}
		const dmUser = dm.user1.userId === self.userId ? dm.user2 : dm.user1;
		return {
			dmId: dm.dmId,
			name: dmUser.username,
			thumbnail: getGravatarLink(dmUser.email),
		};
	}

	@Get("/friend/:id")
	getFriendDm(@Self() self: UserEntity, @Param("id") friendId: string): Promise<DmDTO> {
		return this.dmService.getFriendDm(self, friendId);
	}

	@Get("/message/:id")
	getMessages(
		@Self() self: UserEntity,
		@Param("id") dmId: string,
		@Query("last") lastKnown: string,
		@Query("take") take: number,
	) {
		return this.dmService.getMessagesForDm(self, dmId, lastKnown, take);
	}
}
