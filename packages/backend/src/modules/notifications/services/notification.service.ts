import { Injectable, Logger, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Notification,} from '@prisma/client'
import { NotificationType, NotificationUrgency, type Prisma, } from '@prisma/client'
import type { FilterNotificationsDto,} from '../dto/notification.dto'
import { SortDirection, type GetNotificationsDto, } from '../dto/notification.dto'
import { MailService, } from 'src/modules/mail/mail.service'

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name,)

	constructor(
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
	) { }

	public async getNotifications(query: GetNotificationsDto,): Promise<Array<Notification>> {
		try {
			const { filter, type, } = query
			const where: Prisma.NotificationWhereInput = {}
			if (filter?.contractors || filter?.clients || filter?.addresses) {
				where.OR = []
			}
			where.AND = [] as Array<Prisma.NotificationWhereInput>

			if (type) {
				where.type = type
			}
			if (filter) {
				if (filter.contractors) {
					const contractorFilters = filter.contractors.map((fullName,) => {
						const [name, surname,] = fullName.split(' ',)
						where.OR?.push(
							{ contractor: { name: { equals: name, mode: 'insensitive', }, }, },
							{ contractor: { surname: { equals: surname, mode: 'insensitive', }, }, },
						)
					},)
				}

				if (filter.clients) {
					filter.clients.map((fullName,) => {
						const [firstName, lastName,] = fullName.split(' ',)
						where.OR?.push(
							{ b2CClients: { firstName: { equals: firstName, mode: 'insensitive', }, }, },
							{ b2BClients: { lastName: { equals: lastName, mode: 'insensitive', }, }, },
						)
					},)
				}

				if (filter.addresses) {
					switch (type) {
					case NotificationType.BOOKINGS:
						where.OR?.push(
							{ Booking: { address: { in: filter.addresses, mode: 'insensitive', }, }, },
						)
						break
					case NotificationType.CLIENT:
						where.OR?.push(
							{ b2CClients: { address: { in: filter.addresses, mode: 'insensitive', }, }, },
							{ b2BClients: { address: { in: filter.addresses, mode: 'insensitive', }, }, },
						)
						break
					case NotificationType.CONTRACTOR:
						where.OR?.push(
							{ contractor: { address: { in: filter.addresses, mode: 'insensitive', }, }, },
						)
						break
					}
				}

				if (filter.startDate && filter.endDate) {
					where.date_sent = {
						gte: new Date(filter.startDate,),
						lte: new Date(filter.endDate,),
					}
				} else if (filter.startDate) {
					where.date_sent = {
						gte: new Date(filter.startDate,),
					}
				} else if (filter.endDate) {
					where.date_sent = {
						lte: new Date(filter.endDate,),
					}
				}
			}
			// urgency descending sort means that VERY_URGENT will be at the top, and the NORMAL will be at the bottom
			const orderBy: Array<Prisma.NotificationOrderByWithRelationInput> = [
				{ urgency: SortDirection.DESCENDING, },
				{ date_sent: SortDirection.DESCENDING, },
			]
			return this.prisma.notification.findMany({
				where,
				orderBy,
				include: {
					readAdmin:  true,
					b2CClients: true,
					b2BClients: true,
					contractor: true,
					Booking:    {
						include: {
							b2CClients: true,
							b2BClients: true,
							contractor: true,
						},
					},
				},
			},)
		} catch (error) {
			this.logger.error({ method: this.getNotifications.name, error, },)
			throw error
		}
	}

	public async addNotification(data:Prisma.NotificationCreateInput,): Promise<Notification> {
		try {
			const notification = await this.prisma.notification.create({
				data,
			},)

			const admins = await this.prisma.admin.findMany({
				where: { archived: false, },
			},)

			admins.forEach(async(admin,) => {
				await this.mailService.sendEmail({
					to:      admin.email,
					subject: 'New notifications',
					html:    `<p>New notification recorded in the system.</p><p>Type: ${notification.type}</p><p>Category: ${notification.category}</p>`,
				},)
			},)

			return notification
		} catch (error) {
			this.logger.error({ method: this.updateNotification.name, error, },)
			throw error
		}
	}

	public async updateNotification(notificationId: string, data: Notification,): Promise<Notification> {
		try {
			let updateData = {}

			if (data.readAdminId) {
				updateData = {
					readAdmin: {
						connect: { id: data.readAdminId, },
					},
				}
			} else {
				updateData = {
					readAdmin: {
						disconnect: true,
					},
				}
			}

			const notification = await this.prisma.notification.update({
				where: {
					id: notificationId,
				},
				data: updateData,
			},)

			return notification
		} catch (error) {
			this.logger.error({ method: this.updateNotification.name, error, },)
			throw error
		}
	}

	public async getFilterOptions(): Promise<FilterNotificationsDto> {
		try {
			const contractors = await this.prisma.notification.findMany({
				where: {
					contractorId: {
						not: null,
					},
				},
				select: {
					contractor: {
						select: {
							name:    true,
							surname: true,
						},
					},
				},
				distinct: ['contractorId',],
			},).then((notifications,) => {
				return notifications.map(
					(notification,) => {
						return `${notification.contractor?.name} ${notification.contractor?.surname}`
					},
				)
			},)
			const b2CClients = await this.prisma.notification.findMany({
				where: {
					b2CClientsId: {
						not: null,
					},
				},
				select: {
					b2CClients: {
						select: {
							firstName: true,
							lastName:  true,
						},
					},
				},
				distinct: ['b2CClientsId',],
			},).then((notifications,) => {
				return notifications.map(
					(notification,) => {
						return `${notification.b2CClients?.firstName} ${notification.b2CClients?.lastName}`
					},
				)
			},)
			const b2BClients = await this.prisma.notification.findMany({
				where: {
					b2BClientsId: {
						not: null,
					},
				},
				select: {
					b2BClients: {
						select: {
							firstName: true,
							lastName:  true,
						},
					},
				},
				distinct: ['b2BClientsId',],
			},).then((notifications,) => {
				return notifications.map(
					(notification,) => {
						return `${notification.b2BClients?.firstName} ${notification.b2BClients?.lastName}`
					},
				)
			},)
			const clients = [...b2CClients, ...b2BClients,]

			const addresses = await this.prisma.notification.findMany({
				select: {
					Booking: {
						select: {
							address: true,
						},
					},
					b2CClients: {
						select: {
							address: true,
						},
					},
					b2BClients: {
						select: {
							address: true,
						},
					},
					contractor: {
						select: {
							address: true,
						},
					},
				},
			},).then((notifications,) => {
				const allAddresses = notifications.flatMap((notification,) => {
					return [
						notification.Booking?.address,
						notification.b2CClients?.address,
						notification.b2BClients?.address,
						notification.contractor?.address,
					]
				},)
				return [...new Set(allAddresses.filter(Boolean,) as Array<string>,),]
			},)
			return {
				contractors,
				clients,
				addresses,
			}
		} catch (error) {
			this.logger.error({ method: this.getFilterOptions.name, error, },)
			throw error
		}
	}

	public async getDashboardAllNotifications(): Promise<Array<Notification>> {
		const urgentNotifications = await this.prisma.notification.findMany({
			where: {
				urgency: {
					in: [NotificationUrgency.URGENT, NotificationUrgency.VERY_URGENT,],
				},
			},
			orderBy: {
				date_sent: 'desc',
			},
			take: 5,
		},)
		if (urgentNotifications.length < 5) {
			const additionalNotifications = await this.prisma.notification.findMany({
				where: {
					id: {
						notIn: urgentNotifications.map((notification,) => {
							return notification.id
						},),
					},
				},
				orderBy: {
					date_sent: 'desc',
				},
				take: 5 - urgentNotifications.length,
			},)
			return [...urgentNotifications, ...additionalNotifications,]
		}

		return urgentNotifications
	}
}