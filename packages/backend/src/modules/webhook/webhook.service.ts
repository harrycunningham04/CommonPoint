/* eslint-disable complexity */
import type { RawBodyRequest,} from '@nestjs/common'
import { Injectable, Logger, } from '@nestjs/common'
import { StripeService, } from '../stripe/stripe.service'
import type { Request, } from 'express'
import { BookingClientService, } from '../booking/services/booking-client.service'
import { BookingStatus, } from '@prisma/client'
import { BookingGroupService, } from '../booking-group/booking-group.service'

@Injectable()
export class WebhookService {
	constructor(
    private readonly stripeService: StripeService,
    private readonly bookingService: BookingClientService,
	private readonly bookingGroupService: BookingGroupService,
	) {}

	public async handleWebhook(req: RawBodyRequest<Request>,): Promise<string> {
		const sig = req.headers['stripe-signature']?.toString() ?? ''
		const event = this.stripeService.processEventWebhook(req.rawBody ?? '',sig,)

		console.log('WEBHOOK EVENT', event,)

		switch (event.type) {
		case 'checkout.session.completed':
			const session = event.data.object

			const paymentIntent = session.payment_intent as string

			const bookingId = session.metadata?.['bookingId'] ?? ''
			const bookingDraftId = session.metadata?.['bookingDraftId'] ?? ''
			const isAdditional = session.metadata?.['isAdditional'] ?? false

			if (isAdditional && bookingId) {
				await this.bookingGroupService.updateBookingGroup(bookingId, {
					stripePaymentIntent: paymentIntent,
				},)

				await this.bookingService.processAdditionalBooking(bookingId,)
			}

			if (bookingId) {
				await this.bookingGroupService.updateBookingGroup(bookingId, {
					stripePaymentIntent: paymentIntent,
				},)

				await this.bookingService.updateBookingsByGroup(bookingId, {
					booking_status: BookingStatus.BOOKED,
				},)
			}
			if (bookingDraftId) {
				await this.bookingService.createBookingFromDraft(bookingDraftId,paymentIntent,)
			}
			break
		// case 'invoice.paid':
		// 	const invoiceData = event.data.object
		// 	await this.invoiceService.updateManyInvoice({
		// 		where: {
		// 			stripeInvoiceId: invoiceData.id,
		// 		},
		// 		data: {
		// 			status: InvoiceStatus.PAID,
		// 		},
		// 	},)
		// 	await this.invoiceService.updateInvoicesSentToStripe({
		// 		where: {
		// 			stripeInvoiceId: invoiceData.id,
		// 		},
		// 		data: {
		// 			status: StripeInvoiceStatus.PAID,
		// 		},
		// 	},)
		// 	break
		// case 'invoice.voided':
		// 	const voidedInvoiceData = event.data.object
		// 	await this.invoiceService.updateManyInvoice({
		// 		where: {
		// 			stripeInvoiceId: voidedInvoiceData.id,
		// 		},
		// 		data: {
		// 			status: InvoiceStatus.AWAITING_PAYMENT,
		// 		},
		// 	},)
		// 	break
		default:
			Logger.log(`Unhandled event type ${event.type}`,)
			break
		}
		return 'ok'
	}
}
