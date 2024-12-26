import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
