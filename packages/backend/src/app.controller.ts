import { Controller, Get, Param, Res, } from '@nestjs/common'
import { AppService, } from './app.service'
import { Response, } from 'express'
@Controller()
export class AppController {
	constructor(private readonly appService: AppService,) {}

	@Get('.well-known/:filename',)
	public async getWellKnownFile(@Param('filename',) filename: string, @Res() res: Response,): Promise<void> {
		return this.appService.returnFile(res, filename,)
	}
}
