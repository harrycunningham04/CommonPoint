import { ApiProperty, } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { NotificationCategory, NotificationUrgency, } from '@prisma/client'

export enum NotificationSortBy {
	DATE_SENT = 'dateSent',
	CREATED_AT = 'createdAt',
	URGENCY = 'urgency',
	CATEGORY = 'category',
}

export enum NotificationSortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export class NotificationListQueryDto extends PageOptionsDto {
	@ApiProperty({
		description: 'Search in notification title and message',
		type:        String,
		example:     'booking',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public search?: string

	@ApiProperty({
		description: 'Filter by notification category',
		enum:        NotificationCategory,
		example:     NotificationCategory.BOOKINGS_NEW_BOOKING,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(NotificationCategory,)
	public category?: NotificationCategory

	@ApiProperty({
		description: 'Filter by notification urgency',
		enum:        NotificationUrgency,
		example:     NotificationUrgency.URGENT,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(NotificationUrgency,)
	public urgency?: NotificationUrgency

	@ApiProperty({
		description: 'Filter by read status',
		type:        Boolean,
		example:     false,
		required:    false,
	},)
	@IsOptional()
	public isRead?: boolean

	@ApiProperty({
		description: 'Filter by booking ID',
		type:        String,
		example:     '123e4567-e89b-12d3-a456-426614174000',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public bookingId?: string

	@ApiProperty({
		description: 'Sort by field',
		enum:        NotificationSortBy,
		example:     NotificationSortBy.DATE_SENT,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(NotificationSortBy,)
	public sortBy?: NotificationSortBy = NotificationSortBy.DATE_SENT

	@ApiProperty({
		description: 'Sort order',
		enum:        NotificationSortOrder,
		example:     NotificationSortOrder.DESC,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(NotificationSortOrder,)
	public sortOrder?: NotificationSortOrder = NotificationSortOrder.DESC
}