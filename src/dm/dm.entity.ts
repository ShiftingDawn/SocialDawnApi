import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { DmMessage } from "./dmmessage.entity";

@Entity()
export class Dm {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	dmId: string;

	@OneToOne(() => User)
	@JoinColumn({ name: "owner_id" })
	owner: User;

	@OneToOne(() => User)
	@JoinColumn({ name: "recipient_id" })
	recipient: User;

	@Column({ default: false })
	isGroupChat: boolean;

	@OneToMany(() => DmMessage, (msg) => msg.dm)
	messages: DmMessage[];
}
