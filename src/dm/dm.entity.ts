import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { DmMessage } from "./dmmessage.entity";

@Entity()
export class Dm {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	dmId: string;

	@OneToOne(() => User)
	@JoinColumn({ name: "user1_id" })
	user1: User;

	@OneToOne(() => User)
	@JoinColumn({ name: "user2_id" })
	user2: User;

	@OneToMany(() => DmMessage, (msg) => msg.dm)
	messages: DmMessage[];
}
