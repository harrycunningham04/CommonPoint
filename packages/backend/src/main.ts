import {
	ValidationPipe,
} from '@nestjs/common'
import cookieParser from 'cookie-parser'
import * as bodyParser from 'body-parser'
import {
	NestFactory,
} from '@nestjs/core'
import {
	DocumentBuilder, SwaggerModule,
} from '@nestjs/swagger'
import type {
	Request, Response,
} from 'express'

import {
	AppModule,
} from './app.module'
import checkEnv from './env'
import type { NextFunction, } from 'connect'
import { AllExceptionsFilter, } from './shared/filters/all-exception.filter'
import { HttpExceptionFilter, } from './shared/filters/http-exception.filter'

async function bootstrap(): Promise<void> {
	checkEnv()

	const app = await NestFactory.create(AppModule, {
		bodyParser: true,
		rawBody:    true,
	},)

	app.use((req: Request, res: Response, next: NextFunction,) => {
		if (req.originalUrl === '/webhook') {
			next()
		} else {
			bodyParser.json({ limit: '10mb', },)(req, res, next,)
		}
	},)
	app.use((req: Request, res: Response, next: NextFunction,) => {
		if (req.originalUrl === '/webhook') {
			next()
		} else {
			bodyParser.urlencoded({ limit: '10mb', extended: true, },)(req, res, next,)
		}
	},)

	app.useGlobalPipes(new ValidationPipe({
		transform:            true,
		whitelist:            true,
	},),)

	app.useGlobalFilters(new AllExceptionsFilter(),)
	app.useGlobalFilters(new HttpExceptionFilter(),)

	app.enableShutdownHooks()

	const config = new DocumentBuilder()
		.setTitle('API',)
		.setDescription('Description',)
		.setVersion('1.0',)
		.build()

	const document = SwaggerModule.createDocument(app, config,)
	SwaggerModule.setup('api', app, document,)

	app.enableCors({
		origin:      [
			process.env.FRONTEND_REDIRECT_URL,
			process.env.CLIENT_REDIRECT_URL,
			process.env.CONTRACTOR_REDIRECT_URL,
			process.env.LANDING_REDIRECT_URL,
		],
		credentials: true,
	},)

	app.use(cookieParser(),)

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	await app.listen((process.env['PORT'])  ?? 8080,)
}
bootstrap()
