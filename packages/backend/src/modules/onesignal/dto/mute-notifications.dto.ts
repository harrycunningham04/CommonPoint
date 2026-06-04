import {
	ApiProperty,
} from '@nestjs/swagger'
import {
	NotificationsExpireEnum,
} from '../types/notifications-expire.enum'
import {
	IsNotEmpty,
} from 'class-validator'

export class MuteNotificationsDto {
    @ApiProperty({
    	enum:    NotificationsExpireEnum,
    	isArray: false,
    	example: `${NotificationsExpireEnum.ALLWAYS} | ${NotificationsExpireEnum.ONE_HOUR} | ${NotificationsExpireEnum.ONE_DAY} | ${NotificationsExpireEnum.ONE_WEEK}`,
    },)
    @IsNotEmpty()
	public expire!: NotificationsExpireEnum
}
