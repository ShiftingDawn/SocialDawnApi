import { createHash } from "node:crypto";

export function getGravatarLink(email: string, size?: number) {
	const emailHash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
	return `https://www.gravatar.com/avatar/${emailHash}?s=${size ?? 64}&d=identicon`;
}

export function wrap<T>(value: T): Promise<T> {
	return new Promise((resolve) => resolve(value));
}

export function oneOf<T extends object, K extends keyof T>(value1: T, value2: T, key: K, check: T[K]) {
	if (!value1) return value2;
	if (!value2) return value1;
	if (!value1[key]) return value2;
	if (!value2[key]) return value1;
	return value1[key] === check ? value2 : value1;
}
