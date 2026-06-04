/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Response, } from 'express'

import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common'

import { AdminAuthGuard, ClientAuthGuard, } from '../../shared/guards/jwt.guard'
import { AuthService, } from './auth.service'
import { SHARED_ROUTES, } from './auth.constants'
import { AuthRequest, } from './auth.types'
import { SignInDto, } from './dto/sign-in.dto'

import type { AuthCheckClientReturn, AuthCheckReturn, } from './auth.types'
import type { ClientMessage, Message, } from '../../shared/types'
import { SignUpDto, } from './dto/sign-up.dto'
import { NotificationClientService, } from '../notifications/services/notification-client.service'

@Controller(SHARED_ROUTES.MODULE,)
export class AuthController {
	constructor(
        private readonly authService: AuthService,
		private readonly notificationsService : NotificationClientService,
	) {}

	@UseGuards(AdminAuthGuard,)
	@Get(SHARED_ROUTES.CHECK,)
	public async authCheck(@Req() request: AuthRequest,): Promise<AuthCheckReturn> {
		return this.authService.check(request,)
	}

	@UseGuards(ClientAuthGuard,)
	@Get(SHARED_ROUTES.CLIENT_CHECK,)
	public async clientAuthCheck(@Req() request:AuthRequest,):Promise<AuthCheckClientReturn> {
		return this.authService.checkClient(request,)
	}

	@Post('sign-up-client',)
	public async createClientAccount(@Res({passthrough: true,},) res:Response,@Body() body:SignUpDto,):Promise<Message> {
		return this.authService.signUpClient(body,res,)
	}

	@Post('log-in-client',)
	public async loginClientAccount(@Res({passthrough: true,},) res:Response, @Body() body:SignInDto,):Promise<ClientMessage> {
		const user = await this.authService.loginClient(res,body,)

		if (user.client) {
			await this.notificationsService.createNotificationPreferences(user.client.id, user.clientType!,)
		}

		return user
	}

	@Post('credentials-admin',)
	public async signInAdmin(@Res({
		passthrough: true,
	},) res: Response, @Body() body: SignInDto,): Promise<Message> {
		return this.authService.signInAdmin(res, body,)
	}

	// @Post('credentials',)
	// public async signIn(@Res({
	// 	passthrough: true,
	// },) res: Response, @Body() body: SignInDto,): Promise<Message> {
	// 	return this.authService.signIn(res, body,)
	// }

	@UseGuards(AdminAuthGuard,)
	@Delete('logout',)
	public async logout(@Res({passthrough: true,},) res: Response,): Promise<Message> {
		return this.authService.logout(res,)
	}

	@UseGuards(ClientAuthGuard,)
	@Delete('logout-client',)
	public async clientLogout(@Res({passthrough: true,},) res:Response,):Promise<Message> {
		return this.authService.logoutClient(res,)
	}
}
