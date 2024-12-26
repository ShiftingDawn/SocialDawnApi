import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDTO } from "./login.dto";
import { UserService } from "../user/user.service";
import { User } from "../user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "./session.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		@InjectRepository(Session)
		private readonly sessionRepository: Repository<Session>,
	) {}

	async login(data: LoginDTO): Promise<[string, string]> {
		const user = await this.userService.getUserByEmail(data.email);
		if (!user) {
			throw new NotFoundException("User not found");
		}
		if (!bcrypt.compareSync(data.password, user.password)) {
			throw new UnauthorizedException();
		}
		return await this.createTokens(user);
	}

	async createTokens(user: User): Promise<[string, string]> {
		const accessToken = await this.jwtService.signAsync({ sub: user.userId });
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);
		const session = this.sessionRepository.create({ user, expiresAt });
		await this.sessionRepository.save(session);
		return [accessToken, session.refreshToken];
	}

	async refreshTokens(refreshToken: string): Promise<[string, string]> {
		const session = await this.sessionRepository.findOne({ where: { refreshToken }, relations: ["user"] });
		if (!session) {
			throw new UnauthorizedException();
		}
		const newTokens = await this.createTokens(session.user);
		await this.sessionRepository.delete({ refreshToken });
		return newTokens;
	}
}
