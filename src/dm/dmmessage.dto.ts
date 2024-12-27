export class DmMessageDTO {
	messageId: string;
	username: string;
	responseTo: DmMessageDTO | null;
	sendAt: number;
	message: string;
}
