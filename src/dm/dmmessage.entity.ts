import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { Dm } from "./dm.entity";

@Entity()
export class DmMessage {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	messageId: string;

	@ManyToOne(() => Dm, (dm) => dm.messages)
	@JoinColumn({ name: "dm_id" })
	dm: Dm;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "sender_id" })
	sender: UserEntity;

	@OneToOne(() => DmMessage, { nullable: true })
	@JoinColumn({ name: "response_of_id" })
	responseOf: DmMessage | null;

	@CreateDateColumn()
	sentAt: Date;

	@Column()
	message: string;
}
