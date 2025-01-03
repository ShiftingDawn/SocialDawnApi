import { NestFactory } from "@nestjs/core";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ValidationError } from "class-validator";
import { CORS_OPTIONS } from "./constants";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			stopAtFirstError: true,
			exceptionFactory: validationExceptionFactory,
		}),
	);
	app.enableCors(CORS_OPTIONS);
	app.use(cookieParser(process.env.COOKIE_SECRET ?? "supersecret"));
	await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

function validationExceptionFactory(errors: ValidationError[]) {
	if (errors.length > 0 && errors[0].constraints) {
		const vals = Object.values(errors[0].constraints);
		if (vals.length > 0) {
			return new BadRequestException({
				message: vals[0],
				error: "Bad Request",
				statusCode: 400,
			});
		}
	}
	return new BadRequestException({
		error: "Bad Request",
		statusCode: 400,
	});
}
