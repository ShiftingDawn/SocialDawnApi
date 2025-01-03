import { IsNotEmpty } from "class-validator";

export class AddFriendDTO {
	@IsNotEmpty({ message: "invalid_username" })
	username: string;
}
