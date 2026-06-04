import type { ExceptionFilter, ArgumentsHost,} from '@nestjs/common'
import { Catch, HttpStatus, Logger, } from '@nestjs/common'
import type { Response, } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	public catch(exception: unknown, host: ArgumentsHost,): void {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		const status = HttpStatus.INTERNAL_SERVER_ERROR
		let message = 'Internal server error'

		if (exception instanceof Error) {
			message = typeof exception === 'string' ?
				exception :
				(exception as any).message
		}

		const res = {
			statusCode: status,
			timestamp:  new Date().toISOString(),
			path:       request.url,
			message,
		}

		Logger.error(res,)
		response.status(status,).json(res,)
	}
}
