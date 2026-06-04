/* eslint-disable complexity */
/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
import { Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import { endOfMonth, startOfMonth, } from 'date-fns'
import { PrismaService, } from 'nestjs-prisma'
import type { Contact, } from 'xero-node'
import { CurrencyCode, Invoice, Phone, XeroClient, } from 'xero-node'

@Injectable()
export class XeroService {
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

	private async ensureConnection(): Promise<string> {
		let connection = await this.prisma.xeroConnection.findFirst()

		if (!connection) {
			throw new Error('Xero connection not found',)
		}

		const expiresAt = connection.expiresAt?.getTime() ?? 0
		const now = Date.now()

		if (now >= expiresAt) {
			await this.refreshToken()

			connection = await this.prisma.xeroConnection.findFirst()
		}

		this.xeroClient.setTokenSet({
			access_token:  connection!.accessToken,
			refresh_token: connection!.refreshToken,
			id_token:      connection!.idToken ?? '',
			expires_at:    Math.floor((connection!.expiresAt?.getTime() ?? now) / 1000,),
			token_type:    'Bearer',
			scope:         'openid profile email accounting.transactions offline_access',
		},)

		return connection!.tenantId
	}

	public async refreshToken(): Promise<void> {
		const connection = await this.prisma.xeroConnection.findFirstOrThrow()

		const clientId = this.configService.getOrThrow('XERO_CLIENT_ID',)
		const clientSecret = this.configService.getOrThrow('XERO_CLIENT_SECRET',)

		let newTokenSet
		try {
			newTokenSet = await this.xeroClient.refreshWithRefreshToken(
				clientId,
				clientSecret,
				connection.refreshToken,
			)
		} catch (error) {
			console.error('Xero token refresh failed:', error,)
			throw new Error('Failed to refresh Xero token',)
		}

		const expiresAt = newTokenSet.expires_at ?
			new Date(newTokenSet.expires_at * 1000,) :
			new Date(Date.now() + 1000 * 60 * 60 * 24 * 30,)

		await this.prisma.xeroConnection.update({
			where: { id: connection.id, },
			data:  {
				accessToken:  newTokenSet.access_token,
				refreshToken: newTokenSet.refresh_token,
				idToken:      newTokenSet.id_token,
				expiresAt,
			},
		},)

		this.xeroClient.setTokenSet({
			...newTokenSet,
			expires_at: Math.floor(expiresAt.getTime() / 1000,),
		},)
	}

	public async getXeroToken(code: string,): Promise<string> {
		const redirectUri = this.configService.getOrThrow('XERO_REDIRECT_URI',)
		const callbackUrl = `${redirectUri}?code=${encodeURIComponent(code,)}`
		await this.xeroClient.apiCallback(callbackUrl,)

		await this.xeroClient.updateTenants()

		if (!this.xeroClient.tenants.length) {
			throw new Error('No tenants found for the user',)
		}

		const { tenantId, } = this.xeroClient.tenants[0]

		if (!tenantId) {
			throw new Error('Tenant ID is missing',)
		}

		const tokenSet = this.xeroClient.readTokenSet()

		if (!tokenSet.expires_at) {
			throw new Error('tokenSet.expires_at is undefined',)
		}

		const expiresAt = new Date(tokenSet.expires_at * 1000,)

		await this.prisma.xeroConnection.upsert({
			where:  { tenantId, },
			update: {
				accessToken:  tokenSet.access_token,
				refreshToken: tokenSet.refresh_token,
				idToken:      tokenSet.id_token,
				expiresAt,
			},
			create: {
				tenantId,
				accessToken:  tokenSet.access_token ?? '',
				refreshToken: tokenSet.refresh_token ?? '',
				idToken:      tokenSet.id_token ?? '',
				expiresAt,
			},
		},)

		return tenantId
	}

	public async createInvoiceAndSendToClient(
		clientId: string,
		totalPrice: number,
		bookingGroupIds: Array<string>,
		officeId: string,
	): Promise<void> {
		const tenantId = await this.ensureConnection()
		const xeroContact = await this.findOrCreateXeroContact(clientId,)

		const office = await this.prisma.office.findUniqueOrThrow({
			where: { id: officeId, },
		},)

		const invoicePayload: Invoice = {
			type:      Invoice.TypeEnum.ACCREC,
			contact: {contactID: xeroContact.contactID,},
			date:      new Date().toISOString()
				.split('T',)[0],
			dueDate:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000,).toISOString()
				.split('T',)[0],
			lineItems: [
				{
					description: `Invoice for ${office.title} office - from ${startOfMonth(new Date(),).toISOString()
						.split('T',)[0]} to ${endOfMonth(new Date(),).toISOString()
						.split('T',)[0]}`,
					quantity:    1.0,
					unitAmount:  totalPrice,
					accountCode: '200',

				},
			],
			status:        Invoice.StatusEnum.AUTHORISED,
			sentToContact: true,
			currencyCode:  CurrencyCode.GBP,
		}

		const response = await this.xeroClient.accountingApi.createInvoices(tenantId, {
			invoices: [invoicePayload,],
		},)

		await this.xeroClient.accountingApi.emailInvoice(tenantId, response.body.invoices?.[0]?.invoiceID ?? '', {},
		)

		console.log(response.body.invoices,)
	}

	public async findOrCreateXeroContact(b2bClientId: string,): Promise<Contact> {
		const connection = await this.prisma.xeroConnection.findFirstOrThrow()

		const b2bClient = await this.prisma.b2BClients.findUniqueOrThrow({
			where: { id: b2bClientId, },
		},)

		if (b2bClient.xeroContactId) {
			try {
				const contactResponse = await this.xeroClient.accountingApi.getContact(
					connection.tenantId,
					b2bClient.xeroContactId,
				)
				if (
					contactResponse.body.contacts &&
          contactResponse.body.contacts.length > 0
				) {
					return contactResponse.body.contacts[0]!
				}
			} catch (error) {
				console.warn(
					`Xero contact with id ${b2bClient.xeroContactId} not found. Searching by email.`,
				)
			}
		}

		const existingContacts = await this.xeroClient.accountingApi.getContacts(
			connection.tenantId,
			undefined,
			`EmailAddress=="${b2bClient.email}"`,
		)
		if (
			existingContacts.body.contacts &&
      existingContacts.body.contacts.length > 0
		) {
			const foundContact = existingContacts.body.contacts[0]
			if (b2bClient.xeroContactId !== foundContact?.contactID) {
				await this.prisma.b2BClients.update({
					where: { id: b2bClientId, },
					data:  { xeroContactId: foundContact?.contactID, },
				},)
			}
			return foundContact!
		}

		const newContact: Contact = {
			name:         `${b2bClient.firstName ?? ''} ${b2bClient.lastName ?? ''}`.trim(),
			emailAddress: b2bClient.email,
			phones:       [
				{
					phoneType:   Phone.PhoneTypeEnum.DEFAULT,
					phoneNumber: b2bClient.phoneNumber,
				},
			],
		}
		const createdContactsResponse =
      await this.xeroClient.accountingApi.createContacts(connection.tenantId, {
    		contacts: [newContact,],
      },)

		if (
			!createdContactsResponse.body.contacts ||
      createdContactsResponse.body.contacts.length === 0
		) {
			throw new Error('Failed to create contact in Xero',)
		}

		const createdContact = createdContactsResponse.body.contacts[0]

		await this.prisma.b2BClients.update({
			where: { id: b2bClientId, },
			data:  { xeroContactId: createdContact?.contactID, },
		},)

		return createdContact!
	}
}
