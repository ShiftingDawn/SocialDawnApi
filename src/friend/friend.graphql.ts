import { Field, ID, ObjectType } from "@nestjs/graphql";
import { User } from "@/user/user.graphql";
import { Dm } from "@/dm/dm.graphql";

@ObjectType()
export class Friend {
	@Field(() => ID, { nullable: false })
	id: string;

	@Field(() => User, { nullable: false })
	user: Promise<User>;

	@Field({ nullable: false })
	since: Date;

	@Field(() => Dm, { nullable: false })
	dm: Promise<Dm>;
}

@ObjectType()
export class FriendRequestList {
	@Field(() => [FriendRequest], { nullable: false })
	sent: Promise<FriendRequest[]>;

	@Field(() => [FriendRequest], { nullable: false })
	received: Promise<FriendRequest[]>;
}

@ObjectType()
export class FriendRequest {
	@Field(() => ID, { nullable: false })
	id: string;

	@Field(() => User, { nullable: false })
	user: Promise<User>;

	@Field({ nullable: false })
	sentAt: Date;
}
