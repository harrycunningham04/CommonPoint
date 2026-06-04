import { Injectable, } from '@nestjs/common'
import { NotificationType, NotificationUrgency, } from '@prisma/client'
import type { HelpCreateB2BAccountNotificationQuery, LetUsKnowUnavailableRegionNotificationQuery, } from '../dto/contact-form-notification.dto'
import { NotificationService, } from './notification.service'

@Injectable()
export class NotificationFormService {
	constructor(private readonly notificationService: NotificationService,) {}

	public async helpCreateB2BAccount(query:HelpCreateB2BAccountNotificationQuery,): Promise<void> {
		const notificationItem = {
			title:    'Create B2B account',
			message:  `A client asked to help him create B2B account. 
				Client data: email ${query.email} ; name: ${query.name}; surname: ${query.surname}; phone: ${query.phone}`,
			type:     NotificationType.CLIENT,
			urgency:  NotificationUrgency.URGENT,
		}

		await this.notificationService.addNotification(notificationItem,)
	}

	public async letUsKnowUnavailableRegion(query:LetUsKnowUnavailableRegionNotificationQuery,): Promise<void> {
		const notificationItem = {
			title:    'Client selected unavailable region',
			message:  `A client wants help with selecting his region. His message: ${query.details};
				Client selected address: ${query.address}
				Client data: email ${query.email} ; name: ${query.name}; surname: ${query.surname}`,
			type:     NotificationType.CLIENT,
			urgency:  NotificationUrgency.NORMAL,
		}

		await this.notificationService.addNotification(notificationItem,)
	}
}
