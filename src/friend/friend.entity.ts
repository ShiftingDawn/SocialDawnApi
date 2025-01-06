import { CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "@/user/user.entity";
import { DmEntity } from "@/dm/dm.entity";

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

	@OneToOne(() => DmEntity, (dm) => dm.owningFriend, { nullable: false })
	@JoinColumn({ name: "dm_id" })
	dm: DmEntity;
}
