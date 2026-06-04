import type {
	ExecutionContext,
} from '@nestjs/common'
import {
	BadRequestException,
	createParamDecorator,
} from '@nestjs/common'

export const User = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext,): string => {
		const request = ctx.switchToHttp().getRequest()
		if (!request.id) {
			throw new BadRequestException('User id are required',)
		}
		return request.id
	},
)