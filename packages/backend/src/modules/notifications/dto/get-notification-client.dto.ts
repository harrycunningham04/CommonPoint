/* eslint-disable no-mixed-spaces-and-tabs */
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsUUID, } from 'class-validator'

import { ApiProperty, } from '@nestjs/swagger'
import { IsString, } from 'class-validator'
import type { Booking, BookingGroup, Notification,} from '@prisma/client'
import { NotificationCategory, NotificationType, } from '@prisma/client'

export class BasicNotificationClientDto {
	constructor(data?:BasicNotificationClientDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.category = data.category
			this.bookingAddress = data.bookingAddress
			this.date_sent = data.date_sent
			this.isRead = data.isRead
			this.bookingId = data.bookingId
			this.type = data.type
		}
	}

    @ApiProperty({
    	description: 'The id of the notification',
    	example:     '123e4567-e89b-12d3-a456-426614174000',
    },)
    @IsUUID()
    @IsString()
	public id?: string

    @ApiProperty({
    	description: 'The title of the notification',
    	example:     'Notification Title',
    },)
    @IsString()
    @IsNotEmpty()
    public title?: string

    @ApiProperty({
    	description: 'The category of the notification',
    	example:     'Notification Category',
    },)
    @IsEnum(NotificationCategory,)
    @IsNotEmpty()
    public category?: NotificationCategory

    @ApiProperty({
    	description: 'The booking address of the notification',
    	example:     '123 Main St, Anytown, USA',
    },)
    @IsString()
    @IsNotEmpty()
    public bookingAddress?: string

    @ApiProperty({
    	description: 'The date sent of the notification',
    	example:     '2021-01-01',
    },)
    @IsDate()
    @IsNotEmpty()
    public date_sent?: Date

    @ApiProperty({
    	description: 'The is read of the notification',
    	example:     true,
    },)
    @IsBoolean()
    @IsNotEmpty()
    public isRead?: boolean

    @ApiProperty({
    	description: 'The booking id of the notification',
    	example:     '123e4567-e89b-12d3-a456-426614174000',
    },)
    @IsUUID()
    @IsString()
    public bookingId?: string

	@ApiProperty({
		description: 'The type of notification',
	},)
	@IsEnum(NotificationType,)
    @IsNotEmpty()
    public type? : NotificationType

	public static cast(data: {
		id: string
		title: string
		category: NotificationCategory | null
		type: NotificationType
		date_sent: Date
		isRead: boolean
		Booking?: { id: string; address: string | null } | null
	},): BasicNotificationClientDto {
		return new BasicNotificationClientDto({
			id:             data.id,
			title:          data.title,
			category:       data.category ?? undefined,
			type:           data.type,
			bookingAddress: data.Booking?.address ?? undefined,
			date_sent:      data.date_sent,
			isRead:         data.isRead,
			bookingId:      data.Booking?.id ?? undefined,
		},)
	}
}

export class NotificationResRto {
	constructor(data?:NotificationResRto,) {
		if (data) {
			this.notifications = data.notifications
		}
	}

    @ApiProperty({
    	description: 'The notifications of the notification',
    	example:     [],
    },)
    @IsArray()
    @IsNotEmpty()
	public notifications?: Array<BasicNotificationClientDto>

    public static cast(data: {
		notifications: Array<Notification & { bookingGroup?: BookingGroup & { bookings: Array<Booking> } }>
	},): NotificationResRto {
    	return new NotificationResRto({
    		notifications: data.notifications.map((notification,) => {
    			return new BasicNotificationClientDto({
    				id:             notification.id,
    				title:          notification.title,
    				category:       notification.category ?? undefined,
    				type:           notification.type,
    				bookingAddress: notification.bookingGroup?.bookings[0]?.address ?? undefined,
    				date_sent:      notification.date_sent,
    				isRead:         notification.isRead,
    				bookingId:      notification.bookingGroup?.bookings[0]?.id ?? undefined,
    			},)
    		},),
    	},)
    }
}