import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import { PrismaService, } from 'nestjs-prisma'
import axios, { HttpStatusCode, } from 'axios'
import { text, } from 'src/shared/text/en'
import type { IOneSignalNotificationOptions, IOneSignalReturn, } from './types/notifications-expire.enum'
import type { CreateNotificationDto, } from './dto/notification.dto'
import type { UserDevices, } from '@prisma/client'

@Injectable()
export class OnesignalService {
	// private readonly appId = this.configService.getOrThrow('ONESIGNAL_APP_ID',)

	// private readonly notificationUrl = this.configService.getOrThrow('ONESIGNAL_NOTIFICATION_URL',)

	// private readonly restApiKey = this.configService.getOrThrow('ONESIGNAL_REST_API_KEY',)

	private readonly appId = ''

	private readonly notificationUrl = ''

	private readonly restApiKey = ''

	constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
	) {

	}

	public async attachIdToUser(userId: string, id: string,): Promise<void> {
		try {
			const device = await this.prisma.userDevices.findUnique({
				where: {
					oneSignalId: id,
				},
				include: {
					owner: true,
				},
			},)

			if (!device) {
				await this.prisma.userDevices.create({
					data: {
						oneSignalId: id,
						ownerId:     userId,
						muted:       false,
					},
				},)

				return
			}

			if (device.owner.id === userId) {
				return
			}

			const mappedDevice = { ...device, owner: undefined, }
			await this.prisma.userDevices.create({
				data: {
					...mappedDevice,
					ownerId:    userId,
					muted:      false,
					muteExpiry: null,
				},
			},)
		} catch (err) {
			if (err instanceof ConflictException) {
				throw new ConflictException()
			}
			throw new InternalServerErrorException()
		}
	}

	public async removeIdFromUser(userId: string, id: string,): Promise<void> {
		const device = await this.prisma.userDevices.findUnique({
			where: {
				oneSignalId: id,
				ownerId:     userId,
			},
		},)

		if (!device) {
			throw new NotFoundException()
		}

		try {
			await this.prisma.userDevices.delete({
				where: {
					oneSignalId: id,
				},
			},)
		} catch (err) {
			throw new InternalServerErrorException()
		}
	}

	public async muteNotificationsOnDevice(
		userId: string,
	): Promise<IOneSignalReturn> {
		const oneSignalInstance = await this.prisma.userDevices.findFirst({
			where: {
				ownerId: userId,
			},
		},)

		const device = await this.prisma.userDevices.findUnique({
			where: {
				oneSignalId: oneSignalInstance!.oneSignalId!,
				ownerId:     userId,
			},
		},)

		if (!device) {
			throw new NotFoundException()
		}
		const dev = await this.prisma.userDevices.update({
			where: {
				oneSignalId: oneSignalInstance!.oneSignalId!,
			},
			data: {
				muted: true,
			},
		},)

		return {
			status:  HttpStatusCode.Ok,
			message: text.mutedNotifications,
			data:    dev.muted,
		}
	}

	public async unmuteNotificationsOnDevice(
		userId: string,
	): Promise<IOneSignalReturn> {
		const oneSignalInstance = await this.prisma.userDevices.findFirst({
			where: {
				ownerId: userId,
			},
		},)

		const device = await this.prisma.userDevices.findUnique({
			where: {
				oneSignalId: oneSignalInstance!.oneSignalId!,
				ownerId:     userId,
			},
		},)

		if (!device) {
			throw new NotFoundException()
		}
		const dev = await this.prisma.userDevices.update({
			where: {
				oneSignalId: oneSignalInstance!.oneSignalId!,
			},
			data: {
				muted: false,
			},
		},)

		return {
			status:  HttpStatusCode.Ok,
			message: text.unmutedNotifications,
			data:    dev.muted,
		}
	}

	public async getMuteStatus(userId: string,): Promise<IOneSignalReturn> {
		const oneSignalInstance = await this.prisma.userDevices.findFirst({
			where: {
				ownerId: userId,
			},
		},)
		const device = await this.prisma.userDevices.findUnique({
			where: {
				oneSignalId: oneSignalInstance!.oneSignalId!,
				ownerId:     userId,
			},
		},)

		if (!device) {
			throw new NotFoundException()
		}

		return {
			status:  HttpStatusCode.Ok,
			message: text.notificationsStatus,
			data:    device.muted,
		}
	}

	public async sendNotification(data: IOneSignalNotificationOptions,): Promise<void> {
		try {
			const url = this.notificationUrl
			const config = {
				headers: {
					Authorization:  `Key ${this.restApiKey}`,
					'Content-Type': 'application/json',
				},
			}
			const body = {
				app_id:          this.appId,
				contents:        { en: data.message, },
				headings:        { en: data.title, },
				subtitle:        { en: data.subtitle, },
				include_aliases: {
					onesignal_id: data.oneSignalIds,
				},
				target_channel: 'push',
				// small_icon:     'ic_notification',
				is_android:     true,
				is_ios:         true,
				data:           data.data,
			}
			return axios.post(url, body, config,)
		} catch (error) {
			throw new InternalServerErrorException(error,)
		}
	}

	private async getUserDevices(userId: string,): Promise<Array<UserDevices>> {
		return this.prisma.userDevices.findMany({
			where: {
				ownerId: userId,
			},
		},)
	}

	public async pushNotificationToUser(
		data: CreateNotificationDto,
	): Promise<void> {
		const devices = await this.getUserDevices(data.userId,)
		const players = devices
			.filter((device,) => {
				return device.oneSignalId && !device.muted
			},)
			.map((device,) => {
				return device.oneSignalId!
			},)
		await this.sendNotification({
			oneSignalIds: players,
			title:        '4Serve',
			subtitle:     data.title,
			message:      data.message,
			data:         data.data,
		},)
	}
}
