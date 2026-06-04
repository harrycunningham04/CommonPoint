import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsString, IsUUID, } from 'class-validator'
import type { Notification,} from '@prisma/client'
import { NotificationCategory, NotificationType, } from '@prisma/client'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

export class ContractorNotificationResponseDto {
	constructor(data?: ContractorNotificationResponseDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.category = data.category
			this.bookingAddress = data.bookingAddress
			this.dateSent = data.dateSent
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
	public id!: string

	@ApiProperty({
		description: 'The title of the notification',
		example:     'Notification Title',
	},)
	@IsString()
	@IsNotEmpty()
	public title!: string

	@ApiProperty({
		description: 'The category of the notification',
		example:     'BOOKING',
	},)
	@IsEnum(NotificationCategory,)
	@IsNotEmpty()
	public category!: NotificationCategory

	@ApiProperty({
		description: 'The booking address of the notification',
		example:     '123 Main St, Anytown, USA',
	},)
	@IsString()
	public bookingAddress!: string | null

	@ApiProperty({
		description: 'The date sent of the notification',
		example:     '2021-01-01T00:00:00.000Z',
	},)
	@IsDate()
	@IsNotEmpty()
	public dateSent!: Date

	@ApiProperty({
		description: 'The is read status of the notification',
		example:     true,
	},)
	@IsBoolean()
	@IsNotEmpty()
	public isRead!: boolean

	@ApiProperty({
		description: 'The booking id of the notification',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsUUID()
	public bookingId!: string | null

	@ApiProperty({
		description: 'The type of notification',
		example:     'SYSTEM',
	},)
	@IsEnum(NotificationType,)
	@IsNotEmpty()
	public type!: NotificationType

	public static cast(data: Notification & { Booking?: { id: string; address: string | null } |null},): ContractorNotificationResponseDto {
		return new ContractorNotificationResponseDto({
			id:             data.id,
			title:          data.title,
			category:       data.category ?? NotificationCategory.UPDATE_TERMS_AND_CONDITIONS,
			type:           data.type,
			bookingAddress: data.Booking?.address ?? null,
			dateSent:       data.date_sent,
			isRead:         data.isRead,
			bookingId:      data.Booking?.id ?? null,
		},)
	}
}

export class PagedContractorNotificationsResponseDto implements PagedResDto<ContractorNotificationResponseDto> {
	@ApiProperty({
		description: 'Array of contractor notifications',
		type:        [ContractorNotificationResponseDto,],
	},)
	public data!: Array<ContractorNotificationResponseDto>

	@ApiProperty({
		description: 'Whether there are more pages',
		example:     true,
	},)
	public hasNext!: boolean
}
