import { Field, ID, ObjectType } from "@nestjs/graphql";
import { User } from "@/user/user.graphql";

@ObjectType()
export class Dm {
	@Field(() => ID, { nullable: false })
	id: string;

	@Field(() => User, { nullable: false })
	user: Promise<User>;

	@Field(() => [DmMessage], { nullable: false })
	messages: Promise<DmMessage[]>;
}

@ObjectType()
export class DmMessage {
	@Field(() => ID, { nullable: false })
	id: string;

	@Field(() => User, { nullable: false })
	sender: Promise<User>;

	@Field(() => DmMessage, { nullable: true })
	responseTo: null | Promise<DmMessage>;

	@Field({ nullable: false })
	sentAt: Date;

	@Field(() => String, { nullable: false })
	content: string;
}
