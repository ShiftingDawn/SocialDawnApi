export interface FriendRequestCountDTO {
	sent: number;
	received: number;
}

export interface FriendRequestResponseDTO {
	id: string;
	username: string;
	sentAt: number;
}
