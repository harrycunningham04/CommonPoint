import { ApiProperty, } from '@nestjs/swagger'
import type { Notification,} from '@prisma/client'
import { NotificationCategory, } from '@prisma/client'
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, } from 'class-validator'
import { ENotificationType, } from '../types/create-user-notification.types'

export class GroupedNotificationsDto {
    @ApiProperty({type: String,},)
    @IsString()
    @IsOptional()
	public notificationId?: string

    @ApiProperty({type: String, format: 'date-time',},)
    @IsDate()
    @IsOptional()
    public dateColumn?: Date

    @ApiProperty({type: String,},)
    @IsString()
    @IsOptional()
    public bookingId?: string

    @ApiProperty({type: Number,},)
    @IsInt()
    public count!: number

    @ApiProperty({type: Boolean,},)
    @IsBoolean()
    @IsOptional()
    public isRead?: boolean

    @ApiProperty({enum: NotificationCategory,},)
    @IsEnum(NotificationCategory,)
    @IsOptional()
    public category?: NotificationCategory | null

    @ApiProperty({type: String,},)
    @IsString()
    @IsOptional()
    public title?: string | null

    @ApiProperty({type: String,},)
    @IsString()
    @IsOptional()
    public message?: string | null

    @ApiProperty({type: String,},)
    @IsString()
    @IsOptional()
    public address?: string
}

type NotificationData = Pick<Notification, 'id' | 'bookingId' | 'category' | 'title' | 'message'>;

export class NotificationsByBookingIdResDto {
	@ApiProperty({type: String,},)
	@IsString()
	@IsOptional()
	public notification_id?: string

	@ApiProperty({type: String,},)
	@IsString()
	@IsOptional()
	public booking_id?: string | null

	@ApiProperty({enum: NotificationCategory,},)
	@IsEnum(NotificationCategory,)
	@IsOptional()
	public category?: NotificationCategory | null

	@ApiProperty({type: String,},)
	@IsString()
	@IsOptional()
	public title?: string | null

	@ApiProperty({type: String,},)
	@IsString()
	@IsOptional()
	public message?: string | null

	@ApiProperty({type: String,},)
	@IsString()
	@IsOptional()
	public address?: string

	public static fromNotificationsByBookingId(notifications: Array<NotificationData>, address: string,): Array<NotificationsByBookingIdResDto> {
		const dto = notifications.map((notification,) => {
			return {
				notification_id: notification.id,
				booking_id:      notification.bookingId,
				category:        notification.category,
				title:           notification.title,
				message:         notification.message,
				address,
			}
		},)
		return dto
	}
}

export class UnreadNotificationsCountByTypeDto {
	constructor(data: UnreadNotificationsCountByTypeDto,) {
		this.count = data.count
		this.type = data.type
	}

	@ApiProperty({description: 'Unread notifications count', type: Number,},)
	public count: number

	@ApiProperty({description: 'Type of notification', enum: ENotificationType, example: ENotificationType.JOBS,},)
	public type: ENotificationType

	public static cast(data: {count: number, type: ENotificationType,},): UnreadNotificationsCountByTypeDto {
		return new UnreadNotificationsCountByTypeDto({
			count: data.count,
			type:  data.type,
		},)
	}
}

export class MarkAllNotificationsQueryDto {
	@ApiProperty({enum: ENotificationType, example: ENotificationType.JOBS, description: 'Type of notifications to mark as read',},)
	@IsEnum(ENotificationType,)
	@IsOptional()
	public type?: ENotificationType
}