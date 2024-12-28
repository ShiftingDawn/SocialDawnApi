import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class Friend {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	friendId: string;

	@ManyToOne(() => User)
	@JoinColumn({ name: "user1_id" })
	user1: User;

	@ManyToOne(() => User)
	@JoinColumn({ name: "user2_id" })
	user2: User;

	@CreateDateColumn()
	createdAt: Date;
}
