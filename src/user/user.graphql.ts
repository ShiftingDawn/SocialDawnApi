import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
	@Field(() => ID, { nullable: false })
	id: string;

	@Field(() => String, { nullable: false })
	username: string;

	@Field(() => String, { nullable: false })
	thumbnail: string;
}

@ObjectType()
export class SelfUser extends User {
	@Field(() => String, { nullable: false })
	email: string;
}
