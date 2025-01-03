import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";

@Entity()
export class FriendRequest {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	friendRequestId: string;

	@ManyToOne(() => UserEntity, (user) => user.sentFriendRequests)
	@JoinColumn({ name: "sender_id" })
	sender: UserEntity;

	@ManyToOne(() => UserEntity, (user) => user.receivedFriendRequests)
	@JoinColumn({ name: "receiver_id" })
	receiver: UserEntity;

	@CreateDateColumn()
	createdAt: Date;
}
