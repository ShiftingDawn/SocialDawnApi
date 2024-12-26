import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class RegisterDTO {
	@IsNotEmpty()
	username: string;

	@IsEmail()
	email: string;

	@IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
	password: string;
}
