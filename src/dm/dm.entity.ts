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
import { FriendEntity } from "@/friend/friend.entity";

@Entity("dm")
export class DmEntity {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	dmId: string;

	@OneToMany(() => DmMessageEntity, (msg) => msg.dm)
	messages: DmMessageEntity[];

	@Column({ default: "now()" })
	lastUpdate: Date;

	@OneToOne(() => FriendEntity, (friend) => friend.dm, { nullable: true })
	owningFriend: FriendEntity | null;
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
