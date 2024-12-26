import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Session } from "../auth/session.entity";

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	userId: string;

	@Column({ unique: true })
	email: string;

	@Column()
	username: string;

	@Column()
	password: string;

	@OneToMany(() => Session, (session) => session.user)
	sessions: Session[];
}
