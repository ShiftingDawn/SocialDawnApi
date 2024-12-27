import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import * as console from "node:console";

@WebSocketGateway({ namespace: "dm", cors: "*" })
export class DmGateway {
	@SubscribeMessage("message")
	handleMessage(client: any, payload: any): string {
		return "Hello world!";
	}
}
