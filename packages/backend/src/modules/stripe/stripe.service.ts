/* eslint-disable complexity */
/* eslint-disable no-await-in-loop */
import { BadRequestException, HttpException, Injectable, Logger, UseFilters, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import { CouponType, DiscountType, } from '@prisma/client'
import { HttpExceptionFilter, } from 'src/shared/filters/http-exception.filter'
import Stripe from 'stripe'
import { MailService, } from '../mail/mail.service'
import { JWTService, } from '../jwt/jwt.service'

@Injectable()
@UseFilters(HttpExceptionFilter,)
export class StripeService {
	private readonly stripe: Stripe

	private readonly logger = new Logger(StripeService.name,)

	private readonly endpointSecret = this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET',)

	public readonly frontendUrl = this.configService.getOrThrow('CLIENT_REDIRECT_URL',)

	public readonly landingUrl = this.configService.getOrThrow('LANDING_REDIRECT_URL',)

	public readonly successUrl = `${this.frontendUrl}/new-booking/successful-payment`

	public readonly successUrlDraft = `${this.landingUrl}/new-booking/successful-payment`

	public readonly backendUrl = this.configService.getOrThrow('BACKEND_URL',)

	public readonly contractorRedirectUrl = this.configService.getOrThrow('CONTRACTOR_REDIRECT_URL',)

	private secretKey = this.configService.getOrThrow('STRIPE_SK_KEY',)

	constructor(
        private readonly configService: ConfigService,
				private readonly mailService: MailService,
				private readonly jwtService: JWTService,
	) {
		this.stripe = new Stripe(this.secretKey,)
	}

	public async createProduct(name: string, price: number,additionalPrice?: number,): Promise<Stripe.Response<Stripe.Product>> {
		try {
			const product = await this.stripe.products.create({
				name,
			},)
			const prices = await this.stripe.prices.create({
				unit_amount: Math.round(price * 100,),
				currency:    'GBP',
				product:     product.id,
				metadata:    {
					key: 'base',
				},
			},)

			if (additionalPrice) {
				await this.stripe.prices.create({
					unit_amount: Math.round(additionalPrice * 100,),
					currency:    'GBP',
					product:     product.id,
					metadata:    {
						key: 'additional',
					},
				},)
			}

			const updatedProduct = await this.stripe.products.update(product.id, {
				default_price: prices.id,
			},)
			return updatedProduct
		} catch (error) {
			this.logger.error({ method: this.createProduct.name, error, },)
			throw error
		}
	}

	public async updateProductPrice(
		productId: string,
		newPrice: number,
	): Promise<Stripe.Response<Stripe.Price>> {
		try {
			const price = await this.stripe.prices.create({
				unit_amount: Math.round(newPrice * 100,),
				currency:    'GBP',
				product:     productId,
			},)

			await this.stripe.products.update(productId, {
				default_price: price.id,
			},)

			const oldPrices = await this.stripe.prices.list({
				product: productId,
				active:  true,
			},)

			for (const oldPrice of oldPrices.data) {
				if (oldPrice.id !== price.id) {
					await this.stripe.prices.update(oldPrice.id, { active: false, },)
				}
			}

			return price
		} catch (error) {
			this.logger.error({ method: this.updateProductPrice.name, error, },)
			throw error
		}
	}

	public async createCoupon(couponData: {
        code: string,
        discount: number,
        expiration_date: string,
        owner_id: string,
        type: CouponType,
        targets: any,
        title: string,
		discountType: DiscountType,
    },): Promise<Stripe.Response<Stripe.Coupon>> {
		try {
			const coupon = await this.stripe.coupons.create({
				id:          couponData.code,
				amount_off:  couponData.discountType === DiscountType.AMOUNT ?
					Math.round(couponData.discount * 100,) :
					undefined,
				percent_off: couponData.discountType === DiscountType.PERCENTAGE ?
					couponData.discount :
					undefined,
				currency:    'GBP',
				duration:    couponData.type === CouponType.SINGLE_USE ?
					'once' :
					'forever',
				metadata:   {
					code:     couponData.code,
					owner_id: couponData.owner_id,
					targets:  JSON.stringify(couponData.targets,),
					title:    couponData.title,
				},
				redeem_by: Math.floor(new Date(couponData.expiration_date,).getTime() / 1000,),
			},)

			return coupon
		} catch (error) {
			this.logger.error({ method: this.createCoupon.name, error, },)
			throw error
		}
	}

	public async createCheckoutSession(
		{productIds, bookingId, couponId, isBookingDraft,officeId,}:
		{productIds: Array<string>, bookingId: string, couponId?: string, isBookingDraft?: boolean,officeId?:string},
	): Promise<{ id: string; url: string }> {
		const priceIds = []

		for (const id of productIds) {
			const pricesSearch = await this.stripe.prices.search({
				query: `product:"${id}" AND metadata["officeId"]:"${officeId}" AND active:"true"`,
			},)

			if (pricesSearch.data.length === 0) {
				const allPrices = await this.stripe.prices.search({
					query: `product:"${id}" AND active:"true"`,
				},)

				pricesSearch.data = allPrices.data.filter(
					(price,) => {
						return !price.metadata['officeId']
					},
				)
			}

			if (pricesSearch.data.length === 0) {
				throw new HttpException(`Price not found for product ${id}`, 404,)
			}

			priceIds.push(pricesSearch.data[0]?.id,)
		}

		const session = await this.stripe.checkout.sessions.create({
			mode:                      'payment',
			payment_method_types:      ['card',],
			metadata:                  {
				...(isBookingDraft ?
					{bookingDraftId: bookingId,} :
					{bookingId,}),
			},
			line_items:           priceIds.map((priceId,) => {
				return {
					price:    priceId,
					quantity: 1,
				}
			},),
			...(couponId && {discounts: [
				{
					coupon: couponId,
				},
			],}),
			success_url: isBookingDraft ?
				this.successUrlDraft :
				this.successUrl,
			cancel_url:  `${isBookingDraft ?
				this.landingUrl :
				this.frontendUrl}/new-booking/failed-payment?${isBookingDraft ?
				`bookingDraftId=${bookingId}` :
				`bookingId=${bookingId}`}`,
		},)

		if (!session.url) {
			throw new HttpException('Session url not found', 404,)
		}

		return {
			id:  session.id,
			url: session.url,
		}
	}

	public async createCheckoutSessionWithFixedPrice({price, bookingId, name,couponId,}: {price: number, bookingId: string, name: string,couponId?: string,},): Promise<{ id: string; url: string }> {
		const session = await this.stripe.checkout.sessions.create({
			mode:                 'payment',
			payment_method_types: ['card',],
			metadata:             {
				bookingId,
				isAdditional: 'true',
			},
			line_items: [
				{
					price_data: {
						currency:     'GBP',
						product_data: {
							name: `Additional photos for ${name}`,
						},
						unit_amount: Math.round(price * 100,),
					},
					quantity: 1,
				},
			],
			...(couponId && {discounts: [
				{
					coupon: couponId,
				},
			],}),
			success_url: `${this.frontendUrl}/new-booking/successful-payment`,
			cancel_url:  `${this.frontendUrl}/new-booking/failed-payment`,
		},)

		if (!session.url) {
			throw new HttpException('Session url not found', 404,)
		}

		return {
			id:  session.id,
			url: session.url,
		}
	}

	public async getCheckoutSessionById(sessionId: string,): Promise<Stripe.Checkout.Session> {
		return this.stripe.checkout.sessions.retrieve(sessionId,)
	}

	public async createCustomer({ email, name, }: { email: string; name: string },): Promise<Stripe.Response<Stripe.Customer>> {
		return this.stripe.customers.create({
			email,
			name,
		},)
	}

	public async findCustomerByEmail(email: string,): Promise<Stripe.Customer | null> {
		const customers = await this.stripe.customers.search({
			query: `email:"${email}"`,
		},)
		const customer = customers.data.at(0,)
		return customer ?
			customer :
			null
	}

	public async createInvoiceItems({
		customerId,
		invoiceId,
		invoiceItems,
	}: {
		customerId: string;
		invoiceId: string;
		invoiceItems: Array<{ id: string; amount: number; }>;
	},): Promise<Array<Stripe.InvoiceItem>> {
		const processedInvoiceItems = await Promise.all(invoiceItems.map(async(item,) => {
			return this.stripe.invoiceItems.create({
				invoice:  invoiceId,
				customer:    customerId,
				amount:      item.amount * 100,
				metadata:   {
					invoiceId: item.id,
				},
				currency:    'GBP',
			},)
		},),)

		return processedInvoiceItems
	}

	public async createInvoice({
		customerId,
		b2bCustomerId,
	}: {
		customerId: string;
		b2bCustomerId: string;
	},): Promise<Stripe.Invoice> {
		return this.stripe.invoices.create({
			customer:          customerId,
			metadata: {
				b2bCustomerId,
			},
			collection_method: 'send_invoice',
			days_until_due:    90,
			auto_advance:      false,
		},)
	}

	public async sendInvoice(invoiceId: string,): Promise<Stripe.Invoice> {
		const invoiceSent = await this.stripe.invoices.sendInvoice(invoiceId,)

		await this.mailService.sendEmail({
			to:      invoiceSent.customer_email ?? '',
			subject: 'Invoice',
			text:    `You have a new invoice. Please pay it. ${invoiceSent.hosted_invoice_url}`,
		},)

		return invoiceSent
	}

	public processEventWebhook(body: string | Buffer, sig: string,): Stripe.Event {
		return this.stripe.webhooks.constructEvent(
			body,
			sig,
			this.endpointSecret,
		)
	}

	public getFirstOnboardingLink(): string {
		return `https://connect.stripe.com/oauth/authorize?client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write&suggested_capabilities[]=transfers&response_type=code&redirect_uri=${this.contractorRedirectUrl}/dashboard`
	}

	public async createOnboardingLink(accountId: string, isMobile: boolean = false,): Promise<Stripe.Response<Stripe.AccountLink>> {
		const token = this.jwtService.generateStripeToken(accountId,)
		const redirectUrl = isMobile ?
			`${this.backendUrl}/calendar?stripeToken=${token}` :
			`${this.contractorRedirectUrl}/dashboard?stripeToken=${token}`
		const refreshUrl = isMobile ?
			`${this.backendUrl}/calendar` :
			`${this.contractorRedirectUrl}/dashboard`

		return this.stripe.accountLinks.create({
			account:     accountId,
			refresh_url: refreshUrl,
			return_url:  redirectUrl,
			type:        'account_onboarding',
		},)
	}

	public async callback(code: string, isMobile: boolean = false,): Promise<{
		url: string
	}> {
		const token = await this.stripeCallback(code,)
		if (!token.stripe_user_id) {
			throw new BadRequestException('Stripe user ID not found',)
		}

		const onboardingLink = await this.createOnboardingLink(token.stripe_user_id, isMobile,)
		return {
			url: onboardingLink.url,
		}
	}

	public async stripeCallback(code: string,): Promise<Stripe.OAuthToken> {
		return this.stripe.oauth.token({
			grant_type: 'authorization_code',
			code,
		},)
	}

	public async checkIfUserIsValidForTransfer(id: string,): Promise<boolean> {
		const user = await this.stripe.accounts.retrieve(id,)

		if (user.country !== 'GB') {
			throw new BadRequestException('Your Stripe account must be registered in the United Kingdom (GB). Please recreate your Stripe account with GB as the country.',)
		}

		if (user.default_currency?.toUpperCase() !== 'GBP') {
			throw new BadRequestException('Your Stripe account must use GBP as the default currency.',)
		}

		if (user.capabilities?.transfers !== 'active') {
			throw new BadRequestException('Your Stripe account is not yet activated for transfers. Please complete the onboarding process.',)
		}

		if (!user.payouts_enabled) {
			throw new BadRequestException('Your Stripe account is not yet activated for payouts. Please complete the onboarding process.',)
		}

		return true
	}

	public async transfer(): Promise<void> {
		const transfer = await this.stripe.transfers.create({
			amount:      10000,
			currency:    'gbp',
			destination: 'acct_1RWc7wCAnc1yaIsG',
		},)
	}

	public async transferToContractor(stripeAccountId: string,price: number,): Promise<Stripe.Response<Stripe.Transfer>> {
		const transfer = await this.stripe.transfers.create({
			amount:      price,
			currency:    'gbp',
			destination: stripeAccountId,
		},)

		return transfer
	}

	public async payoutToContractor(stripeAccountId: string, price: number,): Promise<Stripe.Response<Stripe.Payout>> {
		const payout = await this.stripe.payouts.create({
			amount:               price,
			currency:             'gbp',
		}, {
			stripeAccount: stripeAccountId,
		},)

		return payout
	}

	public async getTransferStatus(transferId: string,): Promise<string> {
		const transfer = await this.stripe.transfers.retrieve(transferId,)

		const destinationPayment = transfer.destination_payment as string

		if (!destinationPayment) {
			throw new BadRequestException('Destination payment not found',)
		}

		const payment = await this.stripe.charges.retrieve(destinationPayment, {
			stripeAccount: transfer.destination as string,
		},)

		return payment.status
	}

	public async refundBooking(stripePaymentIntentId: string, amountInCents: number,): Promise<Stripe.Refund> {
		const refund = await this.stripe.refunds.create({
			payment_intent: stripePaymentIntentId,
			amount:         amountInCents,
		},)

		return refund
	}

	public async addPriceOfProductTypeToCheckoutSessionOffice(stripeId:string,officeId:string,price:number,): Promise<Stripe.Response<Stripe.Price>> {
		const existingPrices = await this.stripe.prices.search({
			query: `product:"${stripeId}" AND metadata["officeId"]:"${officeId}" AND active:"true"`,
		},)

		for (const priceObj of existingPrices.data) {
			await this.stripe.prices.update(priceObj.id, { active: false, },)
		}

		return this.stripe.prices.create({
			unit_amount: Math.round(price * 100,),
			currency:    'GBP',
			product:     stripeId,
			metadata:    {
				officeId,
			},
		},)
	}
}
