import { DmMessage } from "./dmmessage.entity";

export class DmMessageDTO {
	messageId: string;
	username: string;
	responseTo: DmMessageDTO | null;
	sendAt: number;
	message: string;

	constructor(entity: DmMessage) {
		this.messageId = entity.messageId;
		this.username = entity.sender.username;
		this.responseTo = entity.responseOf ? new DmMessageDTO(entity.responseOf) : null;
		this.sendAt = entity.sentAt.getTime();
		this.message = entity.message;
	}
}
