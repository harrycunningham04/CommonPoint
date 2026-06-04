import { ApiProperty, } from '@nestjs/swagger'
import type { NotificationUserPreferences, } from '@prisma/client'
import { IsOptional, } from 'class-validator'

export class ChangeNotificationPreferencesDto {
   @ApiProperty()
    @IsOptional()
	public notificationPreferences: Array<NotificationUserPreferences> = []
}
