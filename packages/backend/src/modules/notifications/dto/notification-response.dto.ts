import { ApiProperty, } from '@nestjs/swagger'
import { BasicNotificationClientDto, } from './get-notification-client.dto'
import { NotificationCategory, } from '@prisma/client'
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, } from 'class-validator'

export class NotificationsUnreadCountResDto {
  @ApiProperty({ example: 5, },)
	public notificationsUnread!: number
}

export class PagedBasicNotificationResDto {
  @ApiProperty({ type: [BasicNotificationClientDto,], },)
	public data!: Array<BasicNotificationClientDto>

  @ApiProperty({ example: true, },)
  public hasNext!: boolean
}
