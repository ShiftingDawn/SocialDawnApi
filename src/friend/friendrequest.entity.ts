import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class FriendRequest {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	friendRequestId: string;

	@ManyToOne(() => User, (user) => user.sentFriendRequests)
	@JoinColumn({ name: "sender_id" })
	sender: User;

	@ManyToOne(() => User, (user) => user.receivedFriendRequests)
	@JoinColumn({ name: "receiver_id" })
	receiver: User;

	@CreateDateColumn()
	createdAt: Date;
}
