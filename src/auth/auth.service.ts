import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { ChangePasswordRequestDTO, LoginRequestDTO } from "@/auth/auth.req-dto";
import { UserService } from "@/user/user.service";
import { UserEntity } from "@/user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "./session.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		@InjectRepository(Session)
		private readonly sessionRepository: Repository<Session>,
	) {}

	async createSession(data: LoginRequestDTO): Promise<string> {
		const user = await this.userService.getUserByEmail(data.email);
		if (!user) {
			throw new NotFoundException("User not found");
		}
		if (!bcrypt.compareSync(data.password, user.password)) {
			throw new UnauthorizedException();
		}
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);
		const session = this.sessionRepository.create({ user, expiresAt });
		await this.sessionRepository.save(session);
		return session.sessionId;
	}

	async updateSession(sessionId: string) {
		const session = await this.getSessionById(sessionId);
		if (!session) throw new UnauthorizedException();
		if (Date.now() >= session.expiresAt.getTime()) {
			await this.sessionRepository.delete({ sessionId: sessionId });
			throw new UnauthorizedException();
		} else {
			session.expiresAt = new Date();
			session.expiresAt.setDate(session.expiresAt.getDate() + 7);
			await this.sessionRepository.save(session);
		}
	}

	async destroySession(user: UserEntity, sessionId: string) {
		await this.sessionRepository.delete({ user, sessionId });
	}

	getSessionById(sessionId: string): Promise<Session | null> {
		return this.sessionRepository.findOne({
			where: { sessionId },
			relations: ["user"],
		});
	}

	async changePassword(user: UserEntity, data: ChangePasswordRequestDTO) {
		if (!bcrypt.compareSync(data.oldPassword, user.password)) {
			throw new UnauthorizedException();
		}
		if (data.newPassword !== data.confirmPassword) {
			throw new BadRequestException("passwords_do_not_match");
		}
		await this.userService.setPassword(user, data.newPassword);
	}
}
