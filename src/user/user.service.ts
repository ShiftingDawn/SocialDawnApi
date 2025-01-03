import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import * as bcrypt from "bcrypt";
import { User } from "@/user/user.graphql";
import { getGravatarLink } from "@/utils";
import { CreateUserDTO } from "@/user/user.req-dto";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {}

	getUserById(userId: string): Promise<UserEntity | null> {
		return this.userRepository.findOneBy({ userId });
	}

	getUserByEmail(email: string) {
		return this.userRepository.findOneBy({ email });
	}

	getUserByUsername(username: string) {
		return this.userRepository.findOneBy({ username });
	}

	async getById(id: string): Promise<User | null> {
		const entity = await this.userRepository.findOneBy({ userId: id });
		if (!entity) return null;
		return {
			id: entity.userId,
			username: entity.username,
			thumbnail: getGravatarLink(entity.email),
		};
	}

	async register(data: CreateUserDTO): Promise<void> {
		const existingUser = await this.getUserByEmail(data.email);
		if (existingUser) {
			throw new BadRequestException("User already exists");
		}
		const user = this.userRepository.create({
			username: data.username,
			email: data.email,
			password: bcrypt.hashSync(data.password, 12),
		});
		await this.userRepository.save(user);
	}

	async setPassword(user: UserEntity, password: string) {
		user.password = bcrypt.hashSync(password, 12);
		await this.userRepository.save(user);
	}
}
