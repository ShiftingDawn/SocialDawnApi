import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Session } from "@/auth/session.entity";
import { FriendRequest } from "@/friend/friendrequest.entity";
import { FriendEntity } from "@/friend/friend.entity";

@Entity("user")
export class UserEntity {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	userId: string;

	@Column({ unique: true })
	email: string;

	@Column()
	username: string;

	@Column()
	password: string;

	@OneToMany(() => Session, (session) => session.user)
	sessions: Session[];

	@OneToMany(() => FriendRequest, (session) => session.sender)
	sentFriendRequests: FriendRequest[];

	@OneToMany(() => FriendRequest, (session) => session.receiver)
	receivedFriendRequests: FriendRequest[];

	@OneToMany(() => FriendEntity, (friend) => friend.user1)
	friends: FriendEntity[];
}
