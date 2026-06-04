import type { ExecutionContext, } from '@nestjs/common'
import { createParamDecorator, } from '@nestjs/common'
import type { AuthRequest, } from 'src/modules/auth/auth.types'

export const ReqAdmin = createParamDecorator((data: unknown, ctx: ExecutionContext,) => {
	const request: AuthRequest = ctx.switchToHttp().getRequest()
	if (!request.isAdmin) {
		return null
	}
	return {id: request.id, isAdmin: request.isAdmin, auth: request.auth, }
},)
