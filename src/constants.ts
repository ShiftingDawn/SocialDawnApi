import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

export const CORS_OPTIONS: CorsOptions = {
	origin: ["http://localhost:5173"],
	credentials: true,
};
