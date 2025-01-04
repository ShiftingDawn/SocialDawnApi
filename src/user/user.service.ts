import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import * as bcrypt from "bcrypt";
import { User } from "@/user/user.graphql";
import { getGravatarLink } from "@/utils";
import { CreateUserDTO } from "@/auth/auth.req-dto";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {}

	map(entity: UserEntity): User {
		return {
			id: entity.userId,
			username: entity.username,
			thumbnail: getGravatarLink(entity.email),
		};
	}

	findOneBy(data: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
		return this.userRepository.findOneBy(data);
	}

	async createUser(data: CreateUserDTO): Promise<void> {
		const existingUser = await this.findOneBy({ email: data.email });
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
