import { Controller, Get, } from '@nestjs/common'
import { XeroTestService, } from '../services/xero-test.service'
import type { Invoice, } from 'xero-node'

@Controller('xero-test',)
export class XeroTestController {
	constructor(private readonly xeroTestService: XeroTestService,) {}

	@Get('create-invoice',)
	public async createInvoice(): Promise<Invoice | null> {
		return this.xeroTestService.createTestInvoice()
	}
}