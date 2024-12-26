import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class Session {
	@PrimaryGeneratedColumn("uuid")
	refreshToken: string;

	@Column()
	expiresAt: Date;

	@ManyToOne(() => User)
	@JoinColumn({ name: "user_id" })
	user: User;
}
