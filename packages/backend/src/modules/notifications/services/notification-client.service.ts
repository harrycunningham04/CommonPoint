import { Injectable, } from '@nestjs/common'
import type { Prisma,} from '@prisma/client'
import type { Notification, NotificationUserPreferences, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import { EClientType, } from 'src/shared/types/client.type'
import type { ChangeNotificationDto, } from '../dto/change-notification.dto'
import { NOTIFIFCATION_CLIENT_PREFERENCES, } from '../constants/notification-preferences'
import type { ICreateNotificationUser, } from '../types/create-user-notification.types'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { BasicNotificationClientDto,} from '../dto/get-notification-client.dto'
import { NotificationResRto, } from '../dto/get-notification-client.dto'

@Injectable()
export class NotificationClientService {
	constructor(private readonly prisma: PrismaService,) {}

	private async detectClientType(clientId: string,): Promise<EClientType> {
		const b2cClient = await this.prisma.b2CClients.findFirst({
			where: { id: clientId, },
		},)

		if (b2cClient) {
			return EClientType.B2C
		}

		const b2BClient = await this.prisma.b2BClients.findFirst({
			where: { id: clientId, },
		},)

		if (b2BClient) {
			return EClientType.B2B
		}

		return EClientType.WORKER
	}

	private getNotificationUserWhereForPreferences(clientId: string, clientType: EClientType,): {
		b2CClientId?: string,
		b2BClientId?: string,
		workerId?: string,
	} {
		if (clientType === EClientType.B2C) {
			return {
				b2CClientId: clientId,
			}
		}

		if (clientType === EClientType.B2B) {
			return {
				b2BClientId: clientId,
			}
		}

		return {
			workerId: clientId,
		}
	}

	private getNotificationUserWhere(clientId: string, clientType: EClientType,): {
		b2CClientsId?: string,
		b2BClientsId?: string,
		workerId?: string,
	} {
		if (clientType === EClientType.B2C) {
			return {
				b2CClientsId: clientId,
			}
		}

		if (clientType === EClientType.B2B) {
			return {
				b2BClientsId: clientId,
			}
		}

		return {
			workerId: clientId,
		}
	}

	private async getNotifications(clientId: string, clientType: EClientType,query : PageOptionsDto,):Promise<PagedResDto<BasicNotificationClientDto>> {
		const basicWhere = this.getNotificationUserWhere(clientId, clientType,)
		const basicWhereForPreferences = this.getNotificationUserWhereForPreferences(clientId, clientType,)

		const preferences = await this.prisma.notificationUserPreferences.findMany({
			where: {
				...basicWhereForPreferences,
				enabled:                                                          true,
			},
			select: {
				category: true,
			},
		},)

		const enabledCategories = preferences.map((preference,) => {
			return preference.category
		},)

		const where: Prisma.NotificationWhereInput = {
			...basicWhere,
			category:                                                           {
				in: enabledCategories,
			},
		}

		const notifications = await this.prisma.notification.findMany({
			where,
			orderBy: {
				date_sent: 'desc',
			},
			include: {
				bookingGroup: {
					include: {
						bookings: true,
					},
				},
			},
			take: query.take,
			skip: query.skip,
		},)

		const notificationCount = await this.prisma.notification.count({
			where,
		},)
		return {
			// @ts-ignore
			data:    NotificationResRto.cast({notifications, },).notifications,
			hasNext: notificationCount > query.skip + query.take,
		}
	}

	public async getUnreadClientNotifications(
		clientId: string,
	): Promise<{ notificationsUnread: number }> {
		const clientType = await this.detectClientType(clientId,)

		const basicWhere = this.getNotificationUserWhere(clientId, clientType,)
		const basicWhereForPreferences = this.getNotificationUserWhereForPreferences(clientId, clientType,)

		const preferences = await this.prisma.notificationUserPreferences.findMany({
			where: {
				...basicWhereForPreferences,
				enabled:                                                          true,
			},
			select: {
				category: true,
			},
		},)

		const enabledCategories = preferences.map((preference,) => {
			return preference.category
		},)

		const where: Prisma.NotificationWhereInput = {
			...basicWhere,
			isRead:       false,
			category:                                                           {
				in: enabledCategories,
			},
		}

		const notificationsCount = await this.prisma.notification.count({
			where,
		},)

		return { notificationsUnread: notificationsCount, }
	}

	public async getClientNotifications(clientId: string,query : PageOptionsDto,): Promise<PagedResDto<BasicNotificationClientDto>>  {
		const clientType = await this.detectClientType(clientId,)

		const notifications = await this.getNotifications(
			clientId,
      clientType as EClientType,
	  query,
		)
		return notifications
	}

	public async changeNotificationRead(data: ChangeNotificationDto,): Promise<void> {
		const { notificationId, } = data

		if (!notificationId) {
			throw new Error('Invalid ids',)
		}

		if (Array.isArray(notificationId,)) {
			const notifications = await this.prisma.notification.findMany({
				where: { id: { in: notificationId, }, },
			},)

			if (notifications.length !== notificationId.length) {
				throw new Error('Some notifications were not found',)
			}

			await Promise.all(
				notifications.map(async(notification,) => {
					await this.prisma.notification.update({
						where: { id: notification.id, },
						data:  { isRead: true, },
					},)
				},),
			)
		} else {
			const notification = await this.prisma.notification.findUnique({
				where: { id: notificationId, },
			},)

			if (!notification) {
				throw new Error(`Notification with id ${notificationId} not found`,)
			}

			await this.prisma.notification.update({
				where: { id: notificationId, },
				data:  { isRead: true, },
			},)
		}
	}

	public async createNotificationPreferences(clientId: string, clientType: EClientType,): Promise<void> {
		let clientField = ''

		if (clientType === EClientType.B2B) {
			clientField = 'b2BClientId'
		} else if (clientType === EClientType.B2C) {
			clientField = 'b2CClientId'
		} else {
			clientField = 'workerId'
		}

		const existingPreferences = await this.prisma.notificationUserPreferences.findMany({
			where: {
				[clientField]: clientId,
			},
			select: {
				category: true,
			},
		},)

		const existingCategories = existingPreferences.map((pref,) => {
			return pref.category
		},)
		const missingCategories = NOTIFIFCATION_CLIENT_PREFERENCES.filter(
			(category,) => {
				return !existingCategories.includes(category,)
			},
		)
		if (missingCategories.length === 0) {
			return
		}

		const newPreferences = missingCategories.map((category,) => {
			return {
				[clientField]: clientId,
				category,
				enabled:       true,
			}
		},)
		await this.prisma.notificationUserPreferences.createMany({
			data: newPreferences,
		},)
	}

	public async getNotificationPreference(clientId:string,): Promise<Array<NotificationUserPreferences>> {
		const clientType = await this.detectClientType(clientId,)

		const where = this.getNotificationUserWhere(clientId, clientType,)

		const preferences = await this.prisma.notificationUserPreferences.findMany({
			where: {
				OR: [
					{ b2BClientId: clientId, },
					{ b2CClientId: clientId, },
					{ workerId: clientId, },
				],
			},
		},)

		return preferences
	}

	public async updateNotificationPreference(
		clientId: string,
		preferences: Array<NotificationUserPreferences>,
	): Promise<void> {
		const existingPreferences = await this.prisma.notificationUserPreferences.findMany({
			where: {
				OR: [
					{ b2BClientId: clientId, },
					{ b2CClientId: clientId, },
					{ workerId: clientId, },
				],
			},
		},)

		const existingPreferencesMap = new Map(
			existingPreferences.map((pref,) => {
				return [`${pref.category}`, pref,]
			},),
		)
		for (const newPreference of preferences) {
			const existingPreference = existingPreferencesMap.get(newPreference.category,)

			if (existingPreference) {
				if (existingPreference.enabled !== newPreference.enabled) {
					await this.prisma.notificationUserPreferences.update({
						where: { id: existingPreference.id, },
						data:  {
							enabled:    newPreference.enabled,
							updated_at: new Date(),
						},
					},)
				}
			} else {
				await this.prisma.notificationUserPreferences.create({
					data: {
						b2BClientId: newPreference.b2BClientId,
						b2CClientId: newPreference.b2CClientId,
						workerId:    newPreference.workerId,
						category:    newPreference.category,
						enabled:     newPreference.enabled,
					},
				},)
			}
		}
	}

	public async createNotificationUser(data : ICreateNotificationUser,):Promise<Notification> {
		const {clientId,category,clientType,type,bookingGroupId,} = data

		const isB2C = clientType === EClientType.B2C
		const isB2B = clientType === EClientType.B2B
		const isWorker = clientType === EClientType.WORKER
		let clientConnection: Prisma.NotificationCreateInput = {}

		if (isB2C) {
			clientConnection = { b2CClients: { connect: { id: clientId, }, }, }
		}

		if (isB2B) {
			clientConnection = { b2BClients: { connect: { id: data.clientId, }, }, }
		}

		if (isWorker && data.additionalClientId) {
			clientConnection = {
				b2BClients: { connect: { id: data.additionalClientId, }, },
				worker:     { connect: { id: data.clientId, },},
			}
		}

		const newNotification = await this.prisma.notification.create({
			data: {
				...clientConnection,
				category,
				type,
				bookingGroup: bookingGroupId ?
					{
						connect: {
							id: bookingGroupId,
						},
					} :
					undefined,
			},
		},)

		return newNotification
	}
}
