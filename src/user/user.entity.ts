import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Session } from "../auth/session.entity";
import { FriendRequest } from "../friend/friendrequest.entity";
import { Friend } from "../friend/friend.entity";

@Entity()
export class User {
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

	@OneToMany(() => Friend, (friend) => friend.owner)
	friends: Friend[];
}
