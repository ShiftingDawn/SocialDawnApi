import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.enableCors({
		origin: ["http://localhost:5173"],
		credentials: true,
	});
	app.use(cookieParser(process.env.COOKIE_SECRET ?? "supersecret"));
	await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
