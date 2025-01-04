export interface LoginResponseDTO {
	loginToken: string | null;
}

export interface TotpStatusResponseDTO {
	totpState: "disabled" | "needs_validation" | "enabled";
}
