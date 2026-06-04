/* eslint-disable no-underscore-dangle */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PrismaService, } from 'nestjs-prisma'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { ContractorNotificationResponseDto,} from '../dto/contractor-notification-response.dto'
import { NotificationResRto, } from '../dto/get-notification-client.dto'
import type { NotificationsUnreadCountResDto, } from '../dto/notification-response.dto'
import type { Notification,  NotificationCategory,} from '@prisma/client'
import type { Prisma,} from '@prisma/client'
import type { CreateNotificationContractorDto, } from '../dto/create-notification.dto'
import { Injectable, } from '@nestjs/common'
import { BookingRepository, } from 'src/repositories/booking/booking.repository'
import { ENotificationType, NOTIFICATION_TYPE_LIST,} from '../types/create-user-notification.types'
import { ENotificationFilters, } from '../types/create-user-notification.types'
import type { NotificationPageOptionsDto, } from '../dto/notification-page-options.dto'
import type { GroupedNotificationsDto,  MarkAllNotificationsQueryDto,  UnreadNotificationsCountByTypeDto,} from '../dto/grouped-nofifications.dto'
import type { NotificationListQueryDto, } from '../dto/notification-list.dto'

@Injectable()
export class NotificationContractorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly bookingRepository: BookingRepository,
	) {}

	public async getUnreadContractorNotifications(
		contractorId: string,
	): Promise<NotificationsUnreadCountResDto> {
		let notificationsCount = 0

		notificationsCount = await this.prisma.notification.count({
			where: {
				contractorId,
				isRead: { not: true, },
			},
		},)

		return { notificationsUnread: notificationsCount, }
	}

	public async getContractorNotifications(contractorId: string, query : PageOptionsDto,): Promise<PagedResDto<NotificationResRto>> {
		const notifications = await this.getNotifications(
			contractorId,
			query,
		)
		return notifications
	}

	public async getNotificationsWithFilters(contractorId: string, query: NotificationListQueryDto,): Promise<PagedResDto<ContractorNotificationResponseDto>> {
		const where: Prisma.NotificationWhereInput = {
			contractorId,
		}

		if (query.search) {
			where.OR = [
				{ title: { contains: query.search, mode: 'insensitive', }, },
				{ message: { contains: query.search, mode: 'insensitive', }, },
			]
		}

		if (query.category) {
			where.category = query.category
		}

		if (query.urgency) {
			where.urgency = query.urgency
		}

		if (query.isRead !== undefined) {
			where.isRead = query.isRead
		}

		if (query.bookingId) {
			where.bookingId = query.bookingId
		}

		const orderBy: Prisma.NotificationOrderByWithRelationInput = {}
		if (query.sortBy) {
			if (query.sortBy === 'dateSent') {
				orderBy.date_sent = query.sortOrder ?? 'desc'
			} else if (query.sortBy === 'createdAt') {
				orderBy.created_at = query.sortOrder ?? 'desc'
			} else if (query.sortBy === 'urgency') {
				orderBy.urgency = query.sortOrder ?? 'desc'
			} else if (query.sortBy === 'category') {
				orderBy.category = query.sortOrder ?? 'desc'
			}
		} else {
			orderBy.date_sent = 'desc'
		}

		const [notifications, notificationCount,] = await Promise.all([
			this.prisma.notification.findMany({
				where,
				orderBy,
				include: {
					Booking: {
						select: {
							id:      true,
							address: true,
						},
					},
				},
				take: query.take,
				skip: query.skip,
			},),

			this.prisma.notification.count({
				where,
			},),
		],)

		return {
			data:    notifications.map((notification,) => {
				return ContractorNotificationResponseDto.cast(notification,)
			},),
			hasNext: notificationCount > query.skip + query.take,
		}
	}

	private async getNotifications(contractorId: string, query : PageOptionsDto,):Promise<PagedResDto<NotificationResRto>> {
		const [notifications, notificationCount,] = await Promise.all([
			this.prisma.notification.findMany({
				where: {
					contractorId,
				},
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
			},),

			this.prisma.notification.count({
				where: {
					contractorId,
				},
			},),
		],)

		return {
			// @ts-ignore
			data:    NotificationResRto.cast({notifications, },).notifications ?? [],
			hasNext: notificationCount > query.skip + query.take,
		}
	}

	public async createNotification(data : CreateNotificationContractorDto,):Promise<Notification> {
		const {contractorId, bookingId, readAdminId, ...rest} = data

		return this.prisma.notification.create({
			data: {
				...rest,
				contractor: {
					connect: { id: contractorId, },
				},
				...bookingId && {
					booking: {
						connect: { id: bookingId, },
					},
				},
				...readAdminId && {
					readAdmin: {
						connect: {id: readAdminId, },
					},
				},

			},
		},)
	}

	public async createNotifications(data : Array<Prisma.NotificationCreateManyInput>,):Promise<Prisma.BatchPayload> {
		return this.prisma.notification.createMany({
			data,
		},)
	}

	public async getGroupedNotifications(contractorId: string, query : NotificationPageOptionsDto,):Promise<PagedResDto<any>> {
		const categoryFilter = query.type ?
			ENotificationFilters[query.type].category :
			undefined

		// get grouped notifications with total count and unread count
		const groupedNotifications = await this.prisma.notification.groupBy({
			by:    ['bookingId',],
			where: {
				contractorId,
				bookingId: { not: null, },
				...(categoryFilter && { category: { in: categoryFilter, }, }),
			},
			_count: {
				bookingId: true,
			},
			_max: {
				date_sent: true,
			},
			orderBy: {
				_max: {
					date_sent: 'desc',
				},
			},
			take: query.take + 1,
			skip: query.skip,
		},)

		// get unread counts for grouped notifications
		const unreadCounts = await this.prisma.notification.groupBy({
			by:    ['bookingId',],
			where: {
				contractorId,
				bookingId: { not: null, },
				isRead:    { not: true, },
				...(categoryFilter && { category: { in: categoryFilter, }, }),
			},
			_count: {
				bookingId: true,
			},
		},)

		const individualNotifications = await this.prisma.notification.findMany({
			where: {
				contractorId,
				bookingId: null,
				...(categoryFilter && { category: { in: categoryFilter, }, }),
			},
			select: {
				id:        true,
				date_sent: true,
				isRead:    true,
				category:  true,
				title:     true,
				message:   true,
			},
			orderBy: {
				date_sent: 'desc',
			},
			take: query.take + 1,
			skip: query.skip,
		},)

		// create unread count lookup map
		const unreadCountMap = new Map<string, number>()
		unreadCounts.forEach((group,) => {
			unreadCountMap.set(group.bookingId!, group._count.bookingId,)
		},)

		// combine and sort all notifications by date
		const allNotifications = [
			...groupedNotifications.map((group,) => {
				return {
					notification_id: null,
					date_column:     group._max.date_sent!,
					booking_id:      group.bookingId,
					count:           group._count.bookingId,
					unread_count:    unreadCountMap.get(group.bookingId!,) ?? 0,
					is_read:         null as boolean | null,
					category:        null as NotificationCategory | null,
					title:           null as string | null,
					message:         null as string | null,
				}
			},),
			...individualNotifications.map((notification,) => {
				return {
					notification_id: notification.id,
					date_column:     notification.date_sent,
					booking_id:      null as string | null,
					count:           1,
					unread_count:    notification.isRead ?
						0 :
						1,
					is_read:         notification.isRead,
					category:        notification.category,
					title:           notification.title,
					message:         notification.message,
				}
			},),
		].sort((a, b,) => {
			return new Date(b.date_column,).getTime() - new Date(a.date_column,).getTime()
		},)

		// apply pagination
		const hasNext = allNotifications.length > query.take
		const notifications = allNotifications.slice(0, query.take,)

		// extract booking IDs for additional data fetching
		const bookingIds = notifications
			.map((notification,) => {
				return notification.booking_id
			},)
			.filter((id,): id is string => {
				return id !== null
			},)

		// fetch additional data in parallel
		const [notificationMessages, bookings,] = await Promise.all([
			// get last notification message for each booking
			this.prisma.notification.findMany({
				where: {
					bookingId: { in: bookingIds, },
				},
				select: {
					bookingId: true,
					message:   true,
					date_sent: true,
				},
				orderBy: {
					date_sent: 'desc',
				},
			},),

			// get booking addresses
			this.bookingRepository.findBookings({
				where: {
					id: { in: bookingIds, },
				},
				select: {
					id:      true,
					address: true,
				},
			},),
		],)

		// create lookup maps for last messages (since they're ordered by date desc, first occurrence is the latest)
		const notificationMessagesMap = new Map<string, string>()
		notificationMessages.forEach((notification,) => {
			if (!notificationMessagesMap.has(notification.bookingId!,)) {
				notificationMessagesMap.set(notification.bookingId!, notification.message ?? '',)
			}
		},)

		const bookingAddressMap = new Map<string, string>()
		bookings.forEach((booking,) => {
			bookingAddressMap.set(booking.id, booking.address ?? '',)
		},)

		// transform to final response format
		return {
			data: notifications.map((notification,) => {
				return {
					...notification,
					count:   Number(notification.count,),
					address: bookingAddressMap.get(notification.booking_id ?? '',) ?? '',
					message: notificationMessagesMap.get(notification.booking_id ?? '',) ?? notification.message,
				}
			},),
			hasNext,
		}
	}

	public async getUnreadNotificationsCountForGroups(contractorId: string,): Promise<Array<UnreadNotificationsCountByTypeDto>> {
		const unreadNotificationsCount = await Promise.all(NOTIFICATION_TYPE_LIST.map(async(type,) => {
			const categoryFilter = ENotificationFilters[type].category

			const unreadNotificationsCount = await this.prisma.notification.count({
				where: {
					contractorId,
					isRead: { not: true, },
					...(categoryFilter && { category: { in: categoryFilter, }, }),
				},
			},)

			return {
				count: unreadNotificationsCount,
				type,
			}
		},),)

		return unreadNotificationsCount
	}

	public async getNotificationsByBookingId(
		contractorId: string, bookingId: string, query: NotificationPageOptionsDto,
	): Promise<PagedResDto<GroupedNotificationsDto>> {
		const [takeNotifications, booking,] = await Promise.all([
			this.prisma.notification.findMany({
				where: {
					contractorId,
					bookingId,
				},
				orderBy: {
					date_sent: 'desc',
				},
				take:    query.take + 1,
				skip:    query.skip,
			},),
			this.prisma.booking.findUnique({
				where:  { id: bookingId, },
				select: { address: true, },
			},),
		],)

		const hasNext = takeNotifications.length > query.take
		const notifications = takeNotifications.slice(0, query.take,)

		return {
			data: notifications.map((notification,) => {
				return {
					notification_id: notification.id,
					booking_id:      undefined,
					category:        notification.category,
					title:           notification.title,
					message:         notification.message,
					is_read:         notification.isRead,
					date_column:     notification.created_at,
					address:         booking?.address ?? '',
					count:           1,
					unread_count:    notification.isRead ?
						0 :
						1,
				}
			},),
			hasNext,
		}
	}

	public async markNotificationAsRead(notificationId: string, contractorId: string,): Promise<string> {
		await this.prisma.notification.update({
			where: {
				id:     notificationId,
				contractorId,
				isRead: { not: true, },
			},
			data: {
				isRead: true,
			},
		},)
		return 'Notification marked as read successfully'
	}

	public async markAllNotificationsAsRead(contractorId: string, query: MarkAllNotificationsQueryDto,): Promise<string> {
		const categoryFilter = query.type ?
			ENotificationFilters[query.type].category :
			undefined

		await this.prisma.notification.updateMany({
			where: {
				contractorId,
				isRead: { not: true, },
				...(categoryFilter && { category: { in: categoryFilter, }, }),
			},
			data: {
				isRead: true,
			},
		},)
		return 'All notification marked as read successfully'
	}

	public async markNotificationsAsReadByBookingId(bookingId: string, contractorId: string,): Promise<void> {
		let mode = 1

		if (mode === 0) {
			const notifications = await this.prisma.notification.findMany({
				where: {
					bookingId,
					contractorId,
				},
			},)

			await this.prisma.notification.createMany({
				data: notifications.map((notification,) => {
					const { id, ...rest } = notification
					return { ...rest, created_at: new Date(), isRead: false, }
				},),
			},)
			return
		}
		await this.prisma.notification.updateMany({
			where: {
				bookingId,
				contractorId,
			},
			data: {
				isRead: true,
			},
		},)
	}
}