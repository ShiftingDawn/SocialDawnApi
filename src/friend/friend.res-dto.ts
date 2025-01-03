export interface FriendDTO {
	friendId: string;
	username: string;
	thumbnail: string;
	friendsSince: number;
}

export interface FriendRequestCountDTO {
	sent: number;
	received: number;
}

export interface FriendRequestResponseDTO {
	id: string;
	username: string;
	sentAt: number;
}
