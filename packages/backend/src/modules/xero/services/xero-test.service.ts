import { Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import { PrismaService, } from 'nestjs-prisma'
import type { Contact, LineItem,} from 'xero-node'
import { Invoice,} from 'xero-node'
import {  XeroClient, } from 'xero-node'

@Injectable()
export class XeroTestService {
	private xeroClient: XeroClient

	constructor(
        private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
	) {
		this.xeroClient = new XeroClient({
			clientId:     this.configService.getOrThrow('XERO_CLIENT_ID',),
			clientSecret: this.configService.getOrThrow('XERO_CLIENT_SECRET',),
			redirectUris: [this.configService.getOrThrow('XERO_REDIRECT_URI',),],
			scopes:       [
				'openid',
				'profile',
				'email',
				'accounting.transactions',
				'offline_access',
			],
		},)
	}

	public async refreshToken(): Promise<void> {
		const connection = await this.prisma.xeroConnection.findFirstOrThrow()

		const newTokenSet = await this.xeroClient.refreshWithRefreshToken(
			this.configService.getOrThrow('XERO_CLIENT_ID',),
			this.configService.getOrThrow('XERO_CLIENT_SECRET',),
			connection.refreshToken,
		)

		await this.prisma.xeroConnection.update({
			where: { id: connection.id, },
			data:  {
				accessToken:  newTokenSet.access_token,
				refreshToken: newTokenSet.refresh_token,
				idToken:      newTokenSet.id_token,
				expiresAt:    new Date(newTokenSet.expires_at ?? new Date().getTime() + 1000 * 60 * 60 * 24 * 30,),
			},
		},)

		this.xeroClient.setTokenSet(newTokenSet,)
	}

	public async createTestInvoice(): Promise<Invoice | null> {
		const connection = await this.prisma.xeroConnection.findFirstOrThrow()

		const nowInSeconds = Math.floor(Date.now() / 1000,)
		if (connection.expiresAt.getTime() / 1000 < nowInSeconds) {
			await this.refreshToken()
		} else {
			this.xeroClient.setTokenSet({
				access_token:  connection.accessToken,
				refresh_token: connection.refreshToken,
				id_token:      connection.idToken ?? '',
				expires_at:    Math.floor(connection.expiresAt.getTime() / 1000,),
			},)
		}

		await this.xeroClient.updateTenants()

		const tenantId = this.xeroClient.tenants[0]?.tenantId
		if (!tenantId) {
			throw new Error('No tenant found',)
		}

		const contact: Contact = {
			name:         'Test Client Company',
			emailAddress: 'antonbaranskij12@gmail.com',
		}

		const lineItem: LineItem = {
			description: 'Тестова послуга',
			quantity:    1.0,
			unitAmount:  100.0,
			accountCode: '200',
		}

		const invoice: Invoice = {
			type:      Invoice.TypeEnum.ACCREC,
			contact,
			date:      new Date().toISOString()
				.split('T',)[0],
			dueDate:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000,).toISOString()
				.split('T',)[0],
			lineItems: [lineItem,],
			status:    Invoice.StatusEnum.AUTHORISED,
		}

		const response = await this.xeroClient.accountingApi.createInvoices(tenantId, {
			invoices: [invoice,],
		},)

		await this.xeroClient.accountingApi.emailInvoice(tenantId, response.body.invoices?.[0]?.invoiceID ?? '', {},
		)

		return response.body.invoices?.[0] ?? null
	}
}