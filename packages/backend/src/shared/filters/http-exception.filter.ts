import type {
	ExceptionFilter,
	ArgumentsHost,
} from '@nestjs/common'
import {
	Catch,
	HttpException,
	Logger,
} from '@nestjs/common'
import type {
	Request, Response,
} from 'express'

@Catch(HttpException,)
export class HttpExceptionFilter implements ExceptionFilter {
	public catch(exception: HttpException, host: ArgumentsHost,): void {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const status = exception.getStatus()

		const exceptionResponse = exception.getResponse()
		let message = ''

		if (typeof exceptionResponse === 'object') {
			message =
        typeof (exceptionResponse as any).message === 'string' ?
        	(exceptionResponse as any).message :
        	JSON.stringify((exceptionResponse as any).message,)
		} else if (typeof exceptionResponse === 'string') {
			message = exceptionResponse
		}
		const result = {
			statusCode: status,
			timestamp:  new Date().toISOString(),
			path:       request.url,
			message,
		}
		Logger.error(result,)
		response.status(status,).json(result,)
	}
}
