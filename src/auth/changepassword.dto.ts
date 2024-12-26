import { Allow, IsStrongPassword } from "class-validator";

export class ChangePasswordDTO {
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
