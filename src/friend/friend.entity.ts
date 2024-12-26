import { CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class Friend {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	friendId: string;

	@ManyToOne(() => User, (user) => user.friends)
	@JoinColumn({ name: "owner_id" })
	owner: User;

	@OneToOne(() => User)
	@JoinColumn({ name: "friend_id" })
	friend: User;

	@CreateDateColumn()
	createdAt: Date;
}
