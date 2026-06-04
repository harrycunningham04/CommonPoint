import type { IPushNotificationData, } from '../types/notifications-expire.enum'

export type IHeadingsAndMessages = {
    [key in string]: string
}

export class CreateNotificationDto {
	public userId!: string

	public title!: string

	public message!: string

	public data?: IPushNotificationData
}