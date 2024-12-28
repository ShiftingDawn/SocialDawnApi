import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { CORS_OPTIONS } from "./constants";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth/auth.guard";
import { Self } from "./user/self.decorator";
import { User } from "./user/user.entity";
import { DmService } from "./dm/dm.service";
import { Server, Socket } from "socket.io";
import { DmMessageDTO } from "./dm/dmmessage.dto";

@WebSocketGateway({ cors: CORS_OPTIONS, transports: ["polling"] })
@UseGuards(AuthGuard)
export class AppGateway {
	@WebSocketServer()
	server: Server;

	constructor(private readonly dmService: DmService) {}

	@SubscribeMessage("dm_connect")
	async connectDm(@ConnectedSocket() client: Socket, @Self() user: User, @MessageBody("dm") dmId: string) {
		if (!user || !dmId) {
			return;
		}
		const dm = await this.dmService.getDmByUserAndId(user, dmId);
		if (dm && !client.rooms.has(dm.dmId)) {
			client.join(dm.dmId);
		}
	}

	@SubscribeMessage("dm_disconnect")
	async disconnectDm(@ConnectedSocket() client: Socket, @Self() user: User, @MessageBody("dm") dmId: string) {
		if (!user || !dmId) {
			return;
		}
		const dm = await this.dmService.getDmByUserAndId(user, dmId);
		if (dm && client.rooms.has(dm.dmId)) {
			client.leave(dm.dmId);
		}
	}

	@SubscribeMessage("dm_msg")
	async receiveDmMessage(@Self() user: User, @MessageBody("dm") dmId: string, @MessageBody("msg") message: string) {
		if (!user || !dmId || !message) {
			return;
		}
		const msg = await this.dmService.addMessageToDm(user, dmId, message);
		if (msg) {
			this.server.to(dmId).emit("message", new DmMessageDTO(msg));
		}
		return "ok";
	}
}
