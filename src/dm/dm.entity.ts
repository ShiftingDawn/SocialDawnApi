import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "@/user/user.entity";

@Entity("dm")
export class DmEntity {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	dmId: string;

	@OneToOne(() => UserEntity)
	@JoinColumn({ name: "user1_id" })
	user1: UserEntity;

	@OneToOne(() => UserEntity)
	@JoinColumn({ name: "user2_id" })
	user2: UserEntity;

	@OneToMany(() => DmMessageEntity, (msg) => msg.dm)
	messages: DmMessageEntity[];
}

@Entity("dm_message")
export class DmMessageEntity {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	messageId: string;

	@ManyToOne(() => DmEntity, (dm) => dm.messages)
	@JoinColumn({ name: "dm_id" })
	dm: DmEntity;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "sender_id" })
	sender: UserEntity;

	@OneToOne(() => DmMessageEntity, { nullable: true })
	@JoinColumn({ name: "response_of_id" })
	responseOf: DmMessageEntity | null;

	@CreateDateColumn()
	sentAt: Date;

	@Column()
	message: string;
}
