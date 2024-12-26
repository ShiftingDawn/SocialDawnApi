import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { LoginDTO } from "./login.dto";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
	) {}

	async login(data: LoginDTO): Promise<string> {
		const user = await this.userService.getUserByEmail(data.email);
		if (!user) {
			throw new NotFoundException("User not found");
		}
		if (!bcrypt.compareSync(data.password, user.password)) {
			throw new UnauthorizedException();
		}
		return await this.jwtService.signAsync({
			sub: user.userId,
			username: user.username,
		});
	}
}
