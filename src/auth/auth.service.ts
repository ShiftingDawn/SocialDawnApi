import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { ChangePasswordRequestDTO, CreateUserDTO, LoginRequestDTO } from "@/auth/auth.req-dto";
import { UserService } from "@/user/user.service";
import { UserEntity } from "@/user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "./session.entity";
import { Repository } from "typeorm";
import { TOTP, URI } from "otpauth";
import { TotpEntity } from "@/auth/totp.entity";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		@InjectRepository(Session)
		private readonly sessionRepository: Repository<Session>,
		@InjectRepository(TotpEntity)
		private readonly totpRepository: Repository<TotpEntity>,
	) {}

	async authenticateUser(data: LoginRequestDTO): Promise<[string, boolean]> {
		const user = await this.userService.findOneBy({ email: data.email });
		if (!user) throw new NotFoundException("User not found");

		if (!bcrypt.compareSync(data.password, user.password)) {
			throw new UnauthorizedException();
		}

		const totp = await this.totpRepository.findOneBy({ user, enabled: true });
		if (totp) return [totp.totpId, true];

		return [await this.createSession(user), false];
	}

	async createSession(user: UserEntity): Promise<string> {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);
		const session = this.sessionRepository.create({ user, expiresAt });
		await this.sessionRepository.save(session);
		return session.sessionId;
	}

	async getTotpStatus(user: UserEntity): Promise<boolean | null> {
		const totp = await this.totpRepository.findOneBy({ user });
		if (!totp) return null;
		return totp.enabled;
	}

	async createTotpForUser(user: UserEntity) {
		const totp = new TOTP({
			issuer: "SocialDawn",
			label: user.userId,
		});
		const entity = this.totpRepository.create({
			user,
			uri: totp.toString(),
			enabled: false,
		});
		await this.totpRepository.save(entity);
	}

	async getUnverifiedTotpUriForUser(user: UserEntity) {
		const entity = await this.totpRepository.findOneBy({ user, enabled: false });
		if (!entity) throw new BadRequestException();
		return entity.uri;
	}

	async activateTotpForUser(user: UserEntity, code: string) {
		const entity = await this.totpRepository.findOneBy({ user, enabled: false });
		if (!entity) throw new BadRequestException();
		const totp = URI.parse(entity.uri) as TOTP;
		const delta = totp.validate({ token: code, window: 1 });
		if (delta === null) throw new UnauthorizedException();
		entity.enabled = true;
		await this.totpRepository.save(entity);
	}

	async authenticateUserWithTotpCode(token: string, code: string) {
		const entity = await this.totpRepository.findOne({
			where: { totpId: token, enabled: true },
			relations: ["user"],
		});
		if (!entity) throw new UnauthorizedException();
		const totp = URI.parse(entity.uri) as TOTP;
		const delta = totp.validate({ token: code, window: 1 });
		if (delta === null) throw new UnauthorizedException();
		return await this.createSession(entity.user);
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

	async destroyAllSessions(user: UserEntity) {
		await this.sessionRepository.delete({ user });
	}

	getSessionById(sessionId: string): Promise<Session | null> {
		return this.sessionRepository.findOne({
			where: { sessionId },
			relations: ["user"],
		});
	}

	register(data: CreateUserDTO): Promise<void> {
		return this.userService.createUser(data);
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
