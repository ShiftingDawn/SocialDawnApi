import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Session } from "@/auth/session.entity";
import { FriendRequestEntity } from "@/friend/friendrequest.entity";
import { FriendEntity } from "@/friend/friend.entity";
import { TotpEntity } from "@/auth/totp.entity";

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

	@OneToOne(() => TotpEntity, (totp) => totp.user)
	totp: TotpEntity;

	@OneToMany(() => FriendRequestEntity, (session) => session.sender)
	sentFriendRequests: FriendRequestEntity[];

	@OneToMany(() => FriendRequestEntity, (session) => session.receiver)
	receivedFriendRequests: FriendRequestEntity[];

	@OneToMany(() => FriendEntity, (friend) => friend.user1)
	friends: FriendEntity[];
}
