import type { CanActivate, ExecutionContext, } from '@nestjs/common'
import { Injectable, } from '@nestjs/common'
import { Reflector, } from '@nestjs/core'
import { ACCESS_KEY, } from '../constants/roles.constants'
import type { AuthRequest, } from 'src/modules/auth/auth.types'

/**
 * @param  {RolesGuard} This guard checks if user contains required role
 */
@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector,) {}

	public canActivate(context: ExecutionContext,): boolean {
		const requiredAccess = this.reflector.getAllAndOverride<number>(ACCESS_KEY, [context.getHandler(), context.getClass(),],)
		const request: AuthRequest = context.switchToHttp().getRequest()
		if (!requiredAccess) {
			return true
		}
		const { access, } = request
		return Boolean(access,) && access! >= requiredAccess
	}
}
