import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { RegisterDTO } from "./register.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	getUserByEmail(email: string) {
		return this.userRepository.findOneBy({ email });
	}

	async register(data: RegisterDTO): Promise<void> {
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
}
