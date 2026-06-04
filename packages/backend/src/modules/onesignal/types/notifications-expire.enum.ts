import type { NotificationType, } from '@prisma/client'

export enum NotificationsExpireEnum {
  ONE_HOUR = '1h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ALLWAYS = 'a',
}

export interface IOneSignalReturn {
  status: number,
  message: string,
  data: boolean
}

export interface IPushNotificationData {
  type?: NotificationType
  notificationId?: string
  text?: string
}

export interface IOneSignalNotificationOptions {
  oneSignalIds: Array<string>
  title: string
  subtitle: string
  message: string
  data?: IPushNotificationData
}
