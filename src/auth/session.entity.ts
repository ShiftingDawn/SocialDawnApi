import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "@/user/user.entity";

@Entity()
export class Session {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	sessionId: string;

	@Column()
	expiresAt: Date;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "user_id" })
	user: UserEntity;
}
