import { Query, Resolver } from "@nestjs/graphql";
import { SelfUser, User } from "@/user/user.graphql";
import { Self } from "@/self.decorator";
import { UserEntity } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
import { getGravatarLink } from "@/utils";

@Resolver(() => User)
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query(() => SelfUser)
	async self(@Self() self: UserEntity): Promise<SelfUser> {
		return {
			id: self.userId,
			username: self.userId,
			email: self.email,
			thumbnail: getGravatarLink(self.email),
		};
	}
}
