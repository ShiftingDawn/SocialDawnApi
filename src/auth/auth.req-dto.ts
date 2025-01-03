import { Allow, IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

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
