import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { DmMessage } from "./dmmessage.entity";

@Entity()
export class Dm {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	dmId: string;

	@OneToOne(() => UserEntity)
	@JoinColumn({ name: "user1_id" })
	user1: UserEntity;

	@OneToOne(() => UserEntity)
	@JoinColumn({ name: "user2_id" })
	user2: UserEntity;

	@OneToMany(() => DmMessage, (msg) => msg.dm)
	messages: DmMessage[];
}
