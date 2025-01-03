import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "@/user/user.entity";

@Entity("friend")
export class FriendEntity {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	friendId: string;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "user1_id" })
	user1: UserEntity;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "user2_id" })
	user2: UserEntity;

	@CreateDateColumn()
	createdAt: Date;
}
