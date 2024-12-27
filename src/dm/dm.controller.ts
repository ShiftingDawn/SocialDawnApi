import { Controller, Get, Param, Query } from "@nestjs/common";
import { DmService } from "./dm.service";
import { Self } from "../user/self.decorator";
import { User } from "../user/user.entity";

@Controller("dm")
export class DmController {
	constructor(private readonly dmService: DmService) {}

	@Get("/friend/:id")
	getDm(@Self() self: User, @Param("id") friendId: string) {
		return this.dmService.getFriendDm(self, friendId);
	}

	@Get("/message/:id")
	getMessages(
		@Self() self: User,
		@Param("id") dmId: string,
		@Query("last") lastKnown: string,
		@Query("take") take: number,
	) {
		return this.dmService.getMessagesForDm(self, dmId, lastKnown, take);
	}
}
