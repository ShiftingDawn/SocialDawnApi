import { MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { CORS_OPTIONS } from "./constants";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth/auth.guard";
import { Self } from "./user/self.decorator";
import { User } from "./user/user.entity";
import { DmService } from "./dm/dm.service";

@WebSocketGateway({ cors: CORS_OPTIONS, transports: ["polling"] })
@UseGuards(AuthGuard)
export class AppGateway {
	constructor(private readonly dmService: DmService) {}

	@SubscribeMessage("dm")
	async test(@Self() user: User, @MessageBody("dm") dmId: string, @MessageBody("msg") message: string) {
		if (!user || !dmId || !message) {
			return;
		}
		const msg = await this.dmService.addMessageToDm(user, dmId, message);
		console.log(msg);
		return "ok";
	}
}
