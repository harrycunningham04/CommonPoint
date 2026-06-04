import { Controller, Post, RawBodyRequest, Req, } from '@nestjs/common'
import { WebhookService, } from './webhook.service'
import type { Request, } from 'express'

@Controller('webhook',)
export class WebhookController {
	constructor(private readonly webhookService: WebhookService,) {}

  @Post()
	public async handleWebhook(@Req() req: RawBodyRequest<Request>,): Promise<string> {
		return this.webhookService.handleWebhook(req,)
	}
}
