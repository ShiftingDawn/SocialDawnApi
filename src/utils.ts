import { createHash } from "node:crypto";

export function getGravatarLink(email: string, size?: number) {
	const emailHash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
	return `https://www.gravatar.com/avatar/${emailHash}?s=${size ?? 64}&d=identicon`;
}
