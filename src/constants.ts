import { CorsOptionsDelegate } from "@nestjs/common/interfaces/external/cors-options.interface";

export const CORS_OPTIONS: CorsOptionsDelegate<any> = (req, callback) => {
	const origin = req?.headers?.origin;
	callback(null, {
		origin: origin ?? "*",
		credentials: true,
	});
};

export const SESSION_COOKIE = "session";
