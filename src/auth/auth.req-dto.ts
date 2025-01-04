import { Allow, IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length, Matches } from "class-validator";

export class CreateUserDTO {
	@IsNotEmpty({ message: "invalid_username" })
	@Length(3, 32, { message: "invalid_username" })
	@Matches(/^[a-zA-Z0-9][a-zA-Z0-9-_]+[a-zA-Z0-9]$/)
	username: string;

	@IsEmail(undefined, { message: "invalid_email" })
	email: string;

	@IsStrongPassword(
		{ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 },
		{ message: "password_too_weak" },
	)
	password: string;
}

export class LoginRequestDTO {
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}

export class ChangePasswordRequestDTO {
	@Allow()
	oldPassword: string;

	@IsStrongPassword(
		{ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 },
		{ message: "password_too_weak" },
	)
	newPassword: string;

	@Allow()
	confirmPassword: string;
}

export class OneTimeCodeRequestDTO {
	@IsString()
	@IsNotEmpty()
	code: string;
}

export class LoginCodeRequestDTO {
	@IsString()
	@IsNotEmpty()
	token: string;

	@IsString()
	@IsNotEmpty()
	code: string;
}
