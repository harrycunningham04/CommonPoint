/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable arrow-body-style */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-await-in-loop */
/* eslint-disable capitalized-comments */
/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type {
	ICreateEditMaterialOrderLine,
	ICreateOrderCorrectionList,
	IESoftAssets,
	IOrderLineRequest,
} from './esoft.types'
import {
	ESoftNotificationTypes,
	type ESoftProductTypes,
	type ICreateOrderList,
	type IMaterialHttpFile,
	type IOrderResponse,
} from './esoft.types'
import axios, { AxiosError, } from 'axios'
import { ConfigService, } from '@nestjs/config'
import { products, } from './esoft.constants'
import type { ESoftWebhookParamsDto, } from './dto/webhook-params.dto'
import type { Prisma, } from '@prisma/client'
import { BookingStatus, ESoftOrderStatus, MaterialTypeContent, } from '@prisma/client'
import { EBookingStage, EBookingStatus, } from '../../shared/types/booking.types'
import { getUniqueId, } from './utils/get-unique-id.utill'
import { GetRequestedMaterialsDto, } from './dto/get-requested-materials.dto'
import { transformOrderLineType, } from './utils/transform-order-line-type.utill'
import { EditMaterialService, } from '../edit-material/edit-material.service'
import { getFileSize, } from './utils/get-file-size-from-url.utill'
@Injectable()
export class ESoftService {
	private readonly esoftApi: string

	private readonly apiKey: string

	private readonly clientId: string

	constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
	) {
		this.esoftApi = this.configService.getOrThrow('ESOFT_API_URL',)
		this.apiKey = this.configService.getOrThrow('ESOFT_API_KEY',)
		this.clientId = this.configService.getOrThrow('ESOFT_CLIENT_ID',)
	}

	public async getAllOrders() {
		return this.prisma.eSoftOrder.findMany({
			include: { orderLines: { include: { httpFiles: true, }, }, },
		},)
	}

	public async editMaterials(
		reference: string,
		orderLines: Array<ICreateEditMaterialOrderLine>,
	) {
		const esoftOrderLines: Array<IOrderLineRequest> = []
		for (const orderLine of orderLines) {
			const { id: productId, variant, } = products[orderLine.type]
			esoftOrderLines.push({
				productId,
				variant,
				quantity:  orderLine.quantity ?? orderLine.materials.length,
				httpFiles: orderLine.materials,
			},)
		}

		const esoftOrder = await this.createEsoftOrder({
			clientId:         this.clientId,
			reference,
			receivingCompany: 'esin',
			orderLines:       esoftOrderLines,
		},)

		if (!esoftOrder.orderLines.length) {
			throw new BadRequestException('No order line created',)
		}

		const order = await this.prisma.eSoftOrder.create({
			data: {
				orderId:    esoftOrder.orderId,
				reference,
				orderLines: {
					createMany: {
						data: esoftOrder.orderLines
							.map((orderLine, i,) => {
								const orderLineData = orderLines[i]
								if (!orderLineData) {
									return null
								}
								return {
									type:        orderLineData.type,
									orderLineId: orderLine.orderLineId,
									quantity:    orderLineData.materials.length,
									externalId:  orderLine.externalId,
									productName: orderLine.productName,
									autoMarkBatchReady:
                                        orderLine.autoMarkBatchReady,
								}
							},)
							.filter(
								(o,) => o !== null,
							) as Array<Prisma.ESoftOrderLineCreateManyInput>,
					},
				},
			},
			include: {
				orderLines: true,
			},
		},)

		const materialsCreateData: Array<Prisma.ESoftHttpFileCreateManyInput> =
            []

		for (const [index, orderLine,] of order.orderLines.entries()) {
			const orderLineDto = orderLines[index]
			if (!orderLineDto) {
				continue
			}
			for (const material of orderLineDto.materials) {
				materialsCreateData.push({
					url:         material.url,
					size:        material.size,
					name:        material.name,
					orderLineId: orderLine.id,
				},)
			}
		}

		await this.prisma.eSoftHttpFile.createMany({
			data: materialsCreateData,
		},)

		return order
	}

	public async getEditedMaterials(
		{
			reference,
			orderLineId,
		}: {
			reference?: string,
			orderLineId?: number,
		},
	): Promise<IESoftAssets> {
		const query = new URLSearchParams()
		query.set('clientId', this.clientId,)
		if (reference) {
			query.set('reference', reference,)
		}
		if (orderLineId) {
			query.set('orderLineId', orderLineId.toString(),)
		}
		try {
			const response = await axios.get(
				`${this.esoftApi}/assets/?${query.toString()}`,
				{ headers: this.getHeaders(), },
			)
			return response.data
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				return error.response?.data
			}
			throw new BadRequestException('Failed to get edited materials',)
		}
	}

	public async cancelOrder(id: string,) {
		const order = await this.prisma.eSoftOrder.findUnique({
			where: {
				id,
			},
			include: {
				orderLines: true,
			},
		},)
		if (!order) {
			throw new NotFoundException('Order not found',)
		}

		if (order.status !== ESoftOrderStatus.PENDING) {
			throw new BadRequestException('Order is not pending',)
		}

		for (const orderLine of order.orderLines) {
			await this.cancelEsoftOrder(orderLine.orderLineId,)
		}

		return this.prisma.eSoftOrder.delete({
			where: {
				id: order.id,
			},
		},)
	}

	public async webhook(body: ESoftWebhookParamsDto,) {
		switch (body.type) {
		case ESoftNotificationTypes.ORDER_CREATED:
			await this.handleOrderCreation(body,)
			break
		case ESoftNotificationTypes.ORDER_CREATION_ERROR:
			await this.handleOrderCreationError(body,)
			break
		case ESoftNotificationTypes.DELIVERY:
			await this.handleOrderDelivery(body,)
			break
		default:
			throw new BadRequestException('Invalid notification type',)
		}
	}

	private async handleOrderCreation(body: ESoftWebhookParamsDto,) {
		if (!body.reference) {
			return
		}
		const order = await this.getOrderByReference(body.reference,)
		await this.prisma.eSoftOrder.update({
			where: {
				id: order.id,
			},
			data: {
				status: ESoftOrderStatus.CREATED,
			},
		},)
	}

	private async handleOrderCreationError(body: ESoftWebhookParamsDto,) {
		// Order creation failed
		if (!body.reference) {
			return
		}
		const order = await this.getOrderByReference(body.reference,)
		await this.prisma.eSoftOrder.update({
			where: {
				id: order.id,
			},
			data: {
				status: ESoftOrderStatus.FAILED,
			},
		},)

		// TODO: Materials edit failed logic
	}

	private async handleOrderDelivery(body: ESoftWebhookParamsDto,) {
		// Order completed
		if (!body.reference) {
			return
		}
		const order = await this.getOrderByReference(body.reference,)
		await this.prisma.eSoftOrder.update({
			where: {
				id: order.id,
			},
			data: {
				status: ESoftOrderStatus.COMPLETED,
			},
		},)

		try {
			await this.setBookingEditedMaterials(body.reference,Number(body.orderLineId,),)
		} catch (error) {
			console.log(error,)
		}
	}

	private async getOrderByReference(reference: string,) {
		const order = await this.prisma.eSoftOrder.findUnique({
			where: {
				reference,
			},
			include: {
				orderLines: true,
			},
		},)
		if (!order) {
			throw new NotFoundException('Order not found',)
		}
		return order
	}

	private async createEsoftOrder(
		order: ICreateOrderList,
	): Promise<IOrderResponse> {
		try {
			const response = await axios.post<IOrderResponse>(
				`${this.esoftApi}/orders`,
				order,
				{ headers: this.getHeaders(), },
			)

			return response.data
		} catch (error) {
			if (error instanceof AxiosError) {
				return error.response?.data
			}
			throw new BadRequestException('Failed to create Esoft order',)
		}
	}

	private async cancelEsoftOrder(orderLineId: number,) {
		try {
			const response = await axios.patch(
				`${this.esoftApi}/orders/state`,
				{
					clientId: this.clientId,
					orderLineId,
					state:    'CANCELLED',
				},
				{ headers: this.getHeaders(), },
			)

			return response.data
		} catch (error) {
			if (error instanceof AxiosError) {
				return error.response?.data
			}
			throw new BadRequestException('Failed to create Esoft order',)
		}
	}

	private async createEsoftOrderCorrection(
		order: ICreateOrderCorrectionList,
	): Promise<IOrderResponse> {
		try {
			const response = await axios.post<IOrderResponse>(
				`${this.esoftApi}/order-corrections`,
				order,
				{ headers: this.getHeaders(), },
			)

			return response.data
		} catch (error) {
			if (error instanceof AxiosError) {
				return error.response?.data
			}
			throw new BadRequestException('Failed to create Esoft order correction',)
		}
	}

	private getHeaders() {
		return {
			'Content-Type': 'application/json',
			Authorization:  `EWS ${this.apiKey}`,
		}
	}

	private async setBookingEditedMaterials(reference: string,orderLineId:number,) {
		const materials = await this.getEditedMaterials({orderLineId,},)
		const booking = await this.prisma.booking.findUnique({
			where: {
				id: reference,
			},
		},)
		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const orderLine = await this.prisma.eSoftOrderLine.findUnique({
			where: {
				orderLineId,
			},
			select: {
				type: true,
			},
		},)

		if (!orderLine) {
			throw new NotFoundException('Order line not found',)
		}

		const contentType = transformOrderLineType(orderLine.type,)

		await this.prisma.editedMaterial.deleteMany({
			where: {
				bookingId:    booking.id,
				contentType,
				isCorrection: true,
			},
		},)

		const editedMaterialsCreateData: Array<Prisma.EditedMaterialCreateManyInput> =
            []

		for (const picture of materials.pictures) {
			for (const asset of picture.assets) {
				const fileSize = await getFileSize(asset.secureUrl,)
				editedMaterialsCreateData.push({
					url:         asset.secureUrl,
					name:        picture.name ?? '',
					fileSize:    fileSize ?? 0,
					bookingId:   booking.id,
					contentType: MaterialTypeContent.PHOTOS,
				},)
			}
		}

		for (const video of materials.videos) {
			const fileSize = await getFileSize(video.profiles[video.profiles.length - 1]?.secureUrl ?? '',)

			editedMaterialsCreateData.push({
				url:         video.profiles[video.profiles.length - 1]?.secureUrl ?? '',
				name:        video.name ?? '',
				fileSize:    fileSize ?? 0,
				bookingId:   booking.id,
				contentType: MaterialTypeContent.VIDEOS,
			},)
		}

		await this.prisma.editedMaterial.createMany({
			data: editedMaterialsCreateData,
		},)

		await this.prisma.booking.update({
			where: {
				id: booking.id,
			},
			data: {
				booking_stage: {
					push: EBookingStage.PHOTOS_DELIVERED,
				},
				booking_status: BookingStatus.IN_REVIEW,
			},
		},)
	}

	public async changeOrderStatus(orderId:number,status:ESoftOrderStatus,) {
		const order = await this.prisma.eSoftOrder.findUnique({
			where: {
				orderId,
			},
		},)

		if (!order) {
			throw new NotFoundException('Order not found',)
		}

		if (order.status !== ESoftOrderStatus.PENDING) {
			throw new BadRequestException('Order is not pending',)
		}

		await this.prisma.eSoftOrder.update({
			where: {
				id: order.id,
			},
			data: {
				status,
			},
		},)
	}

	public async createEditCorrectionOrder(sessionId:string,) {
		const session = await this.prisma.editRequestSession.findUnique({
			where: {
				id: sessionId,
			},
			include: {
				editRequests: {
					include: {
						editRequestMaterials: true,
					},
				},
			},
		},)

		if (!session) {
			throw new NotFoundException('Session not found',)
		}

		console.log(session,)

		const getRequestedMaterialsDto = GetRequestedMaterialsDto.cast(session,)

		const orderLineId = await this.prisma.eSoftOrderLine.findUnique({
			where: {
				id: getRequestedMaterialsDto.orderLineId,
			},
		},)

		if (!orderLineId) {
			throw new NotFoundException('Order line not found',)
		}

		console.log(getRequestedMaterialsDto,)

		const order = await this.createEsoftOrderCorrection({
			clientId:    this.clientId,
			orderLineId: orderLineId.orderLineId,
			quantity:    getRequestedMaterialsDto.quantity,
			comments:    getRequestedMaterialsDto.comments,
			httpFiles:   getRequestedMaterialsDto.httpFiles,
		},)

		return order
	}
}
