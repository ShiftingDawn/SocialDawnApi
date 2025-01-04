import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "@/user/user.entity";

@Entity("user_totp")
export class TotpEntity {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	totpId: string;

	@OneToOne(() => UserEntity, (user) => user.totp)
	@JoinColumn({ name: "user_id" })
	user: UserEntity;

	@Column({ unique: true })
	uri: string;

	@Column()
	enabled: boolean;
}
