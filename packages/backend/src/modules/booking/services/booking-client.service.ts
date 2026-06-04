/* eslint-disable no-await-in-loop */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-lines */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { BadRequestException, HttpException, Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import {
	FilterClientDto,
	GetBookingClientDto,
} from '../dto/get-client-booking.dto'
import { Booking, BookingDuration, BookingGroup, BookingPreference, BookingReview, BookingStatus, BookingType, ContractorSkillNama, ContractorTransportation, MaterialRawType, MaterialTypeContent, NotificationCategory, NotificationType, PaymentPreference, Prisma, RouteCache, } from '@prisma/client'
import { ChangeBookingDto, } from '../dto/change-booking.dto'
import { VoteBookingDto, } from '../dto/vote-booking.dto'
import { IBookingFormData, } from 'src/shared/types/booking.types'
import { EClientType, } from 'src/shared/types/client.type'
import { StripeService, } from 'src/modules/stripe/stripe.service'

import { IProcessedPhoto, } from '../booking.types'
import { UploadService, } from 'src/modules/upload/upload.service'
import path from 'path'
import { CreateReviewDto, } from '../dto/create-booking-review.dto'
import { Express, } from 'express'

import { IProductVariant, } from 'src/shared/types/product.types'
import { NotificationClientService, } from 'src/modules/notifications/services/notification-client.service'
import { MapService, } from 'src/modules/map/map.service'
import { ReviewService, } from 'src/modules/review/review.service'
import { basicBookingClientWhere, IncludeAllBookingInfo, SelectBookingSkills, } from '../booking.const'
import { BookingUniqueSkills, SkillDto, } from '../dto'
import { BOOKING_PREFERENCE, transformPreference, transformVideoDuration, } from '../utils/transform-preferences'
import { BookingGroupService, } from 'src/modules/booking-group/booking-group.service'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { WorkerService, } from 'src/modules/clients/services/worker.service'
import { BookingBasicService, } from './booking-basic.service'
import { BookingClientListDto, } from '../dto/booking-client-list.dto'
import { BookingClientDetailsDto, } from '../dto/booking-client-details.dto'
import { DraftBookingDto, } from '../dto/booking-client-creation.dto'
import { BookingDraftService, } from './booking-draft.service'
import { ClientsB2CService, } from 'src/modules/clients/services/b2c.service'
import { ClientsB2BService, } from 'src/modules/clients/services/b2b.service'
import { IBookingWithAllInfo, } from 'src/modules/booking-group/dto/booking-client-group.dto'
import { GetBookingsDto, } from 'src/modules/dashboard/dto/get-bookings.dto'
import { AdditionalPhotoCheckoutDto, CreateAdditionalBookingDto, GetAdditionalBookingCheckoutDto, } from '../dto/booking-additional.dto'
import { ProductService, } from 'src/modules/products/products/products.service'
import { BookingMaterialService, } from 'src/modules/booking-material/services/booking-materials.service'
import { EditMaterialService, } from 'src/modules/edit-material/edit-material.service'
import { BookingRoutesService, } from 'src/modules/booking-routes/services/booking-routes.services'
import { mapTransportationToTravelMode, } from '../utils/transform-transportation'
import { PreferencesService, } from 'src/modules/clients/services/preferences-service'
import { ConfigService, } from '@nestjs/config'
import { OfficeService, } from 'src/modules/clients/services/office.service'
import { ClientBasicService, } from 'src/modules/clients/services/client-basic.service'
import { ClientType, } from 'src/modules/clients/types/client.types'
import { PackageService, } from 'src/modules/products/packages/packages.service'
@Injectable()
export class BookingClientService {
	constructor(private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
		private readonly bookingGroupService: BookingGroupService,
		private readonly uploadService: UploadService,
		private readonly notificationService : NotificationClientService,
		private readonly mapService : MapService,
		private readonly reviewService: ReviewService,
		private readonly workerService: WorkerService,
		private readonly bookingBasicService: BookingBasicService,
    private readonly bookingDraftService: BookingDraftService,
		private readonly clientB2CService: ClientsB2CService,
		private readonly clientB2BService: ClientsB2BService,
		private readonly productService: ProductService,
		private readonly bookingMaterialService: BookingMaterialService,
		private readonly editMaterialService: EditMaterialService,
		private readonly bookingRoutesService : BookingRoutesService,
		private readonly preferencesService: PreferencesService,
		private readonly configService: ConfigService,
		private readonly officeService: OfficeService,
		private readonly clientBasicService: ClientBasicService,
		private readonly packageService: PackageService,
	) {}

	private getBookingClientFilter(filter: FilterClientDto,) {
		const filterWhere: Prisma.BookingWhereInput = {}

		const { startDate, endDate, statuses, squares, } = filter

		if (statuses && statuses.length > 0) {
			Object.assign(filterWhere, {
				booking_status: {
					in: statuses,
				},
			},)
		}

		if (squares) {
			const [min, max,] = squares.map((it,) => {
				return Number.parseInt(it, 10,)
			},)

			Object.assign(filterWhere, {
				square_footage: {
					gte: min,
					lte: max,
				},
			},)
		}

		if (startDate && endDate) {
			Object.assign(filterWhere, {
				date_time: {
					gte: startDate,
					lte: endDate,
				},
			},)
		} else if (startDate) {
			Object.assign(filterWhere, {
				date_time: {
					gte: startDate,
				},
			},)
		} else if (endDate) {
			Object.assign(filterWhere, {
				date_time: {
					lte: endDate,
				},
			},)
		}

		return filterWhere
	}

	public async findBooking(bookingId: string,): Promise<any | null> {
		const booking = await this.prisma.booking.findFirst({
		  where: {
				id: bookingId,
		  },
		  include: {
				editedMaterial: {
			  orderBy: {
						isHeroShoot: 'desc',
			  },
			  include: {
						EditedMaterialVote: true,
			  },
				},
				location: true,

				BookingReview: true,
				rawMaterial:   {
			  include: {
						RawMaterialVote: true,
			  },
				},
				BookingStageHistory: {
			  orderBy: {
						timestamp: 'asc',
			  },
				},
				...SelectBookingSkills,
		  },
		},)

		if (!booking) {
		  return null
		}

		return {
		  ...booking,
		  ProductTypeBooking: {
				preferences:      [],
				durationSettings: [],
				skills:           BookingUniqueSkills.getUniqueSkills(booking,),
		  },
		}
	  }

	  public async getBookings(clientId: string, data: GetBookingClientDto, isOffice?: boolean,) {
		const { search, filter, officeIds, skip, take, } = data

		const clientType = await this.clientBasicService.getClientTypeById(clientId,)

		let baseWhere: Prisma.BookingWhereInput = {
			booking_status: {
				notIn: [BookingStatus.AWAITING_PAYMENT, BookingStatus.CANCELED,],
			},
		}

		if (search) {
			baseWhere.address = {
				contains: search,
				mode:     'insensitive',
			}
		}

		if (officeIds?.length) {
			baseWhere.officeId = {
				in: officeIds,
			}
		}

		if (filter) {
			const filterWhere = this.getBookingClientFilter(filter,)

			if (filter.showArchive !== 'true') {
				filterWhere.archived = false
			}

			baseWhere = {
				...baseWhere,
				...filterWhere,
			}
		}

		let where: Prisma.BookingWhereInput = isOffice ?
			{ officeId: clientId, } :
			{
				OR: [
					{ b2BClientsId: clientId, },
					{ b2CClientsId: clientId, },
				],
			  }

		where = {
			...where,
			...baseWhere,
		}

		const workerWhere: Prisma.BookingWhereInput = {
			AND: [
				{
					officeId: {
						in: officeIds,
					},
				},
				baseWhere,
			],
		}

		if (clientType === ClientType.B2B || clientType === ClientType.B2C) {
			const bookingFromGroup = await this.bookingGroupService.getBookingsForClient({
				where: {
					OR: [
						{ b2BClientsId: clientId, },
						{ b2CClientsId: clientId, },
					],
				},
				skip,
				take,
				include: {
					bookings: {
						where,
						include: {
							...IncludeAllBookingInfo,
							BookingStageHistory: true,
						},
					},
				},
			},)

			const totalCount = await this.bookingGroupService.getBookingsForClientCount({
				OR: [
					{ b2BClientsId: clientId, },
					{ b2CClientsId: clientId, },
				],
			},)

			const bookingWithMaterial = await Promise.all(bookingFromGroup.map(async(booking,) => {
				const hasMaterial = await this.bookingGroupService.getBookingMaterial(booking.id,)
				return BookingClientListDto.cast(booking,hasMaterial,)
			},),)

			return {
				data:    bookingWithMaterial,
				hasNext: totalCount > take + skip,
			}
		}

		const bookingWorker = await this.workerService.getBookingsForWorker({
			bookingWhere:   baseWhere,
			workerId:       clientId,
			bookingInclude: {
				...IncludeAllBookingInfo,
				BookingStageHistory: true,
			},
			take,
			skip,
		},)

		const totalCount = await this.bookingGroupService.getBookingsForClientCount({
			workerId: clientId,
		},)
		const bookingWithMaterial = await Promise.all(bookingWorker.map(async(booking,) => {
			const hasMaterial = await this.bookingGroupService.getBookingMaterial(booking.id,)
			return BookingClientListDto.cast(booking,hasMaterial,)
		},),)

		return {
			data:    bookingWithMaterial,
			hasNext: totalCount > take + skip,
		}
	}

	public async getProductContractorIds(productIds: Array<string>,): Promise<Map<string, string>> {
		const map = new Map<string, string>()
		const contractors = await this.prisma.productType.findMany({
			where: {
				id: {
					in: productIds,
				},
			},
			select: {
				id:           true,
				contractorId: true,
			},
		},)

		contractors.forEach((it,) => {
			if (it.contractorId) {
				map.set(it.id, it.contractorId,)
			}
		},)

		return map
	}

	public async updateBooking(bookingId: string, data: ChangeBookingDto,) {
		const isBookingCanceled = data.booking_status === BookingStatus.CANCELED

		// if(isBookingCanceled){
		// 	await this.notificationService.createNotificationUser()
		// }
		const booking = await this.prisma.booking.update({
			where: {
				id: bookingId,
			},
			data,
		},)

		return booking
	}

	public async updateBookingsByGroup(bookingGroupId: string, data: ChangeBookingDto,) {
		const booking = await this.prisma.booking.updateMany({
			where: {
				bookingGroupId,
			},
			data,
		},)

		return booking
	}

	public async updateBookingGroup(bookingGroupId:string,data:Prisma.BookingGroupUpdateInput,) {
		const updatedGroup = await this.prisma.bookingGroup.update({
			where: {
				id: bookingGroupId,
			},
			data,
		},)

		return updatedGroup
	}

	public async updateBookingsInGroup(
		bookingGroupId: string,
		data: Prisma.BookingUpdateInput,
	  ) {
		const updatedBookings = await this.prisma.booking.updateMany({
		  where: {
				bookingGroupId,
		  },
		  data,
		},)

		return updatedBookings
	  }

	private async throwErrorIfBookingIsNotAvailable(bookings: Array<Array<IProductVariant>>,) {
		const bookingsWithoutOrders = bookings.filter((product,) => {
			const firstProduct = product.at(0,)
			return firstProduct && firstProduct.requiresOnSiteContractor
		},)
		const where: Prisma.BookingWhereInput = {
			OR: bookingsWithoutOrders.map((product,) => {
				const firstProduct = product.at(0,)
				if (!firstProduct) {
					throw new NotFoundException('No product found',)
				}
				const dateTime = new Date(firstProduct.dateTime ?? '',)
				const startTime = new Date(dateTime,)
				startTime.setMinutes(startTime.getMinutes() - (firstProduct.timeToCurrentLocation ?? 0),)
				const endTime = new Date(startTime,)
				endTime.setMinutes(endTime.getMinutes() + ((firstProduct.duration) + (firstProduct.timeToNextLocation ?? 0)),)
				return {
					contractorId: firstProduct.contractorId ?? '',
					date_time:    {
						gte: startTime,
						lte: endTime,
					},
				}
			},),
		}

		const booking = await this.prisma.booking.count({
			where,
		},)
		if (booking > 0) {
			throw new BadRequestException('Booking is not available',)
		}
	}

	public async createBooking(data: IBookingFormData,): Promise<BookingGroup> {
		const isB2C = data.clientType === EClientType.B2C
		const isB2B = data.clientType === EClientType.B2B
		const isWorker = data.clientType === EClientType.WORKER
		let clientConnection: Prisma.BookingGroupCreateInput = {}

		if (isB2C) {
			clientConnection = { b2CClients: { connect: { id: data.clientId, }, }, }
		}

		if (isB2B) {
			clientConnection = { b2BClients: { connect: { id: data.clientId, }, }, }
		}
		let b2BClientId: string | undefined
		if (isWorker && data.userId) {
			b2BClientId = await this.clientB2BService.getB2BClientIdByWorkerId(data.userId,)
			clientConnection = {
				...(b2BClientId && {b2BClients: { connect: { id: b2BClientId, }, },}),
				worker:     { connect: { id: data.userId, },},
			}
		}

		const officeConnection = data.officeId ?
			{
				office: {
					connect: {
						id: data.officeId,
					},
				},
			} :
			null

		let newPaymentPreference: PaymentPreference | null = null

		if (data.officeId) {
			const paymentPreference = await this.officeService.getPaymentPreferencesByOfficeId(data.officeId,)
			if (paymentPreference) {
				newPaymentPreference = paymentPreference
			}
		}

		const bookingGroup = await this.prisma.bookingGroup.create({
			data: {
				...clientConnection,
				...officeConnection,
				sumOfPrices:         data.total,
				stripePaymentIntent: data.stripePaymentIntent,
				paymentPreference:   newPaymentPreference ?? PaymentPreference.STRIPE,
			},
		},)

		const locationCoords = await this.mapService.getCoordFromPlaceId(data.placeId,)

		const keysLocationCoords = data.keysPlaceId ?
			await this.mapService.getCoordFromPlaceId(data.keysPlaceId,) :
			null

		const prepareBookingData = (type: BookingType, products : Array<IProductVariant>, newContractorId?: string,):Prisma.BookingCreateInput => {
			const transformedDuration = products.flatMap((product,) => {
				return product.durationSettings.map((setting,) => {
					return transformVideoDuration(setting,)
				},)
			},).filter((duration,) : duration is BookingDuration => {
				return duration !== null
			},)
			const transformedPreferences = products.flatMap((product,) => {
				return product.preferences.map((item,) => 	{
					return transformPreference(item as BOOKING_PREFERENCE,)
				},)
			},).filter((duration,) : duration is BookingPreference => {
				return duration !== null
			},)

			const firstProduct = newContractorId ?
				{
					...products.at(0,),
					contractorId: newContractorId,
				} :
				products.at(0,)

			if (!firstProduct) {
				throw new NotFoundException('No product found',)
			}

			const sumOfDuration = products.reduce((acc, curr,) => {
				return acc + curr.duration
			}, 0,)

			const sumOfPrice = products.reduce((acc, curr,) => {
				return acc + curr.price
			}, 0,)

			const bookingStatus = data.booking_status ?? newPaymentPreference === PaymentPreference.INVOICES ?
				BookingStatus.BOOKED :
				BookingStatus.AWAITING_PAYMENT

			return {
				bookingType:          type,
				address:              data.address,
				property_type:        data.propertyType,
				propertyDetails:      data.propertyDetails,
				propertyAccess:       data.propertyAccessType,
				number_of_bedrooms:   data.numberOfBedrooms,
				square_footage:       data.squareFootage.toString(),
				key_instruction:      data.keysDetails,
				key_location_address: data.keysAddress,
				keysDateTime:         data.keysDateTime,
				keyLocation:          keysLocationCoords ?
					{
						create: {
							placeId:   keysLocationCoords.placeId,
							latitude:  keysLocationCoords.lat,
							longitude: keysLocationCoords.lng,
						},
					} :
					undefined,
				date_time:            firstProduct.dateTime,
				contractor:           firstProduct.contractorId ?
					{ connect: { id: firstProduct.contractorId, }, } :
					undefined,
				total_sum:            sumOfPrice.toString(),
				duration:             sumOfDuration,
				durationInMinutes:    sumOfDuration,
				booking_status:       bookingStatus,
				isAlarm:              data.isAlarm,
				alarmCode:            data.alarmCode,
				alarmDetails:         data.alarmDetails,
				trusteeName:          data.trusteeName,
				trusteePhone:         data.trusteePhone,
				trusteeRelationship:  data.trusteeRelationship,
				coupon:               data.coupon,
				durationSettings:     transformedDuration,
				preferences:          transformedPreferences,
				package:              firstProduct.packageId ?
					{ connect: { id: firstProduct.packageId, }, } :
					undefined,
				BookingToProductType: {
					create: products.map((product,) => {
						return {
							productType: {
								connect: { id: product.id, },
							},
						}
					},),
				},
				...clientConnection,
				...officeConnection,
				bookingGroup:         {
					connect: {
						id: bookingGroup.id,
					},
				},
				location:             {
					create: {
						placeId:   locationCoords?.placeId,
						latitude:  locationCoords?.lat ?? 0,
						longitude: locationCoords?.lng ?? 0,
					},
				},
			}
		}

		const bookings = data.selectedProductsGroups.filter((product,) => {
			return product.some((product,) => {
				return product.requiresOnSiteContractor
			},)
		},)

		await this.throwErrorIfBookingIsNotAvailable(bookings,)

		const bookingsData = bookings
			.map((product,) => {
				return prepareBookingData(BookingType.BOOKING, product,)
			},)

		const orders = data.selectedProductsGroups
			.filter((product,) => {
				return !product.some((product,) => {
					return product.requiresOnSiteContractor
				},)
			},)

		const contractorsForOrders = await this.getProductContractorIds(orders.flatMap((it,) => {
			return it.map((product,) => {
				return product.id
			},)
		},),)

		const ordersData = orders
			.map((product,) => {
				const firstProduct = product.at(0,)
				const newContractor = contractorsForOrders.get(firstProduct?.id ?? '',)
				return prepareBookingData(BookingType.ORDER, product, newContractor,)
			},)

		const createdBookings = await Promise.all(
			[...bookingsData, ...ordersData,].map(async(booking,) => {
				return this.prisma.booking.create({ data: booking, },)
			},),
		)

		// if (!isB2C && createdBookings[0]?.officeId) {
		// 	const firstAdmin = await this.adminService.getFirstAdminId()
		// 	await this.invoiceService.createInvoice({
		// 		sum:   data.total.toString(),
		// 		admin: {
		// 			connect: {
		// 				id: firstAdmin,
		// 			},
		// 		},
		// 		bookingGroup: {
		// 			connect: {
		// 				id: bookingGroup.id,
		// 			},
		// 		},
		// 		office: {
		// 			connect: {
		// 				id: createdBookings[0]?.officeId,
		// 			},
		// 		},
		// 	},)
		// }

		await this.notificationService.createNotificationUser({
			clientId:           data.clientId!,
			clientType:         data.clientType,
			additionalClientId: b2BClientId,
			category:           NotificationCategory.BOOKINGS_NEW_BOOKING,
			type:               NotificationType.BOOKINGS,
			bookingGroupId:     bookingGroup.id,
		},)

		return bookingGroup
	}

	public async getBookingProductIdsForStripe(bookingGroupId: string,): Promise<Array<string>> {
		const bookingGroup = await this.prisma.bookingGroup.findFirst({
			where:  { id: bookingGroupId, },
			select: {
			  bookings: {
					select: {
						package: {
							select: {
								stripeId: true,
							},
						},
						BookingToProductType: {
							select: {
								productType: {
									select: { stripeId: true, },
								},
							},
						},
					},
			  },
			},
		  },)

		if (!bookingGroup) {
			throw new Error('Booking not found',)
		}

		const idsSet = new Set<string>()

		bookingGroup.bookings.forEach((booking,) => {
			if (booking.package?.stripeId) {
				idsSet.add(booking.package.stripeId,)
			} else {
				booking.BookingToProductType.forEach((pt,) => {
					const id = pt.productType.stripeId
					if (id) {
						idsSet.add(id,)
					}
				},)
			}
		},)

		return Array.from(idsSet,)
	}

	public async getBookingTotalPrice(bookingGroupId: string,): Promise<number> {
		const bookingGroup = await this.prisma.bookingGroup.findFirst({
			where:  { id: bookingGroupId, },
			select: { bookings: {
				select: {
					packageId:            true,
					BookingToProductType: {
						select: {
							productType: {
								select: { id: true, price: true, },
							},
						},
					},
				},
			},officeId: true, },
		},)

		let totalPrice = 0

		for (const booking of bookingGroup?.bookings ?? []) {
			if (booking.packageId) {
				totalPrice = totalPrice + await this.packageService.getPackageTotalPrice(booking.packageId,)
			} else if (bookingGroup?.officeId) {
				totalPrice = totalPrice + await this.officeService.getOfficeProductsPrices(bookingGroup.officeId, booking.BookingToProductType.map((item,) => {
					return item.productType.id
				},),)
			} else {
				totalPrice = totalPrice + booking.BookingToProductType.reduce((acc, curr,) => {
					return acc + curr.productType.price
				}, 0,)
			}
		}

		return totalPrice
	}

	private async getAllStripeIdsByProductIds(productIds: Array<string>,): Promise<Array<string>> {
		const productTypes = await this.prisma.productType.findMany({
			where:  { id: { in: productIds, }, },
			select: { stripeId: true, },
		},)
		return productTypes.map((productType,) => {
			return productType.stripeId
		},)
	}

	public async getCouponId(bookingGroupId: string,): Promise<string | undefined> {
		const booking = await this.prisma.booking.findFirst({
			where:  { bookingGroupId, },
			select: {
				coupon: true,
			},
		},)

		if (!booking) {
			throw new Error('Booking not found',)
		}
		const coupon = await this.prisma.coupon.findFirst({
			where:  { code: booking.coupon ?? '', },
			select: {
				stripeId: true,
			},
		},)

		return coupon?.stripeId ?? undefined
	}

	public async getCouponIdByCode(code?: string,): Promise<{
		stripeId: string,
	} | null> {
		if (!code) {
			return null
		}
		return this.prisma.coupon.findFirst({
			where:  { code, },
			select: { stripeId: true, },
		},)
	}

	private async createNewBookingPayment(bookingGroupId: string,officeId?:string): Promise<{ url: string;id:string }> {
		const products = await this.getBookingProductIdsForStripe(bookingGroupId,)
		const couponId = await this.getCouponId(bookingGroupId,)
		const totalPrice = await this.getBookingTotalPrice(bookingGroupId,)

		const { url,id,} = await this.stripeService.createCheckoutSession({
			productIds: products,
			bookingId:  bookingGroupId,
			couponId,
			officeId,
		},)

		return {
			url,
			id,
		}
	}

	public async createBookingDraftPayment({
		bookingDraftId,
	}: {
		bookingDraftId: string,
	},): Promise<{ url: string;id:string }> {
		const bookingDraft = await this.bookingDraftService.getDraftBooking(bookingDraftId,)

		if (!bookingDraft) {
			throw new NotFoundException('Draft are not found!',)
		}

		const selectedProductsIds = new Set<string>()

		bookingDraft.selectedProducts.forEach((item,) => {
			if (item.packageId) {
				selectedProductsIds.add(item.packageId,)
			} else {
				selectedProductsIds.add(item.id,)
			}
		},)

		const products = await this.getAllStripeIdsByProductIds(Array.from(selectedProductsIds,),)
		const coupon = await this.getCouponIdByCode(bookingDraft.coupon,)
		const { url,id,} = await this.stripeService.createCheckoutSession({
			productIds:     products,
			bookingId:      bookingDraftId,
			couponId:       coupon?.stripeId,
			isBookingDraft: true,
		},)

		return {
			url,
			id,
		}
	}

	public async createBookingAndReturnRedirectUrl(data: IBookingFormData,): Promise<{ url: string; bookingId : string }> {
		const newBookingGroup = await this.createBooking(data,)

		await this.createRouteByBookingGroupId(newBookingGroup.id,)

		await this.preferencesService.preferencesByBookingGroupId(newBookingGroup.id,)

		const {officeId,} = newBookingGroup

		let paymentPreferencesNew: PaymentPreference | null = null

		if (officeId) {
			paymentPreferencesNew = await this.officeService.getPaymentPreferencesByOfficeId(officeId,)
		}

		if (paymentPreferencesNew === PaymentPreference.INVOICES) {
			return {
				url:       `${this.configService.getOrThrow('FRONTEND_URL',)}/new-booking/successful-payment?invoiced=true`,
				bookingId: newBookingGroup.id,
			}
		}

		// if (newBooking.b2BClientsId) {
		// 	return {
		// 		url:       `${this.frontendUrl}/bookings`,
		// 		bookingId: newBooking.id,
		// 	}
		// }


		const { url,} = await this.createNewBookingPayment(newBookingGroup.id,newBookingGroup.officeId ?? undefined)

		await this.bookingBasicService.createNotificationsForBookingGroup(newBookingGroup.id,)

		return {
			url,
			bookingId: newBookingGroup.id,
		}
	}

	public async createRouteByBookingGroupId(bookingGroupId: string,): Promise<void> {
		const bookingGroup = await this.prisma.bookingGroup.findFirst({
			where:   { id: bookingGroupId, },
			include: {
				bookings: {
					where: {
						bookingType: BookingType.BOOKING,
					},
				},
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		bookingGroup.bookings.forEach((booking,) => {
			this.createRouteByBookingId(booking.id,)
		},)
	}

	public async createRouteByBookingId(bookingId: string,): Promise<void> {
		const booking = await this.prisma.booking.findFirst({
			where:  { id: bookingId, },
			select: {
				id:           true,
				contractorId: true,
				date_time:    true,
				location:     true,
				contractor:   {
					select: {
						transportation:     true,
						ContractorLocation: true,
					},
				},
			},
		},)

		if (!booking?.location) {
			throw new NotFoundException('Booking not found or has no location',)
		}

		const transportation = booking.contractor?.transportation ?? ContractorTransportation.PUBLIC_TRANSPORTATION
		const contractorLocation = booking.contractor?.ContractorLocation

		// === 1. previous → booking
		const previousBooking = await this.prisma.booking.findFirst({
			where: {
				contractorId:   booking.contractorId,
				date_time:      { lt: booking.date_time, },
				booking_status: {
					notIn: [
						BookingStatus.CANCELED,
						BookingStatus.DONE,
						BookingStatus.AWAITING_PAYMENT,
					],
				},
				location: { isNot: null, },
			},
			orderBy: { date_time: 'desc', },
			select:  { location: true, },
		},)

		const fromLat = previousBooking?.location?.latitude ?? contractorLocation?.latitude
		const fromLng = previousBooking?.location?.longitude ?? contractorLocation?.longitude

		if (fromLat && fromLng) {
			const route = await this.bookingRoutesService.getOrCreateRoute({
				fromLat,
				fromLng,
				toLat: booking.location.latitude,
				toLng: booking.location.longitude,
				transportation,
			},)

			await this.prisma.bookingRoute.create({
				data: {
					bookingId: booking.id,
					duration:  route.duration,
					distance:  route.distance,
					polyline:  route.polyline,
				},
			},)
		}

		// === 2. booking → next
		const nextBooking = await this.prisma.booking.findFirst({
			where: {
				contractorId:   booking.contractorId,
				date_time:      { gt: booking.date_time, },
				booking_status: {
					notIn: [
						BookingStatus.CANCELED,
						BookingStatus.DONE,
						BookingStatus.AWAITING_PAYMENT,
					],
				},
				location: { isNot: null, },
			},
			orderBy: { date_time: 'asc', },
			select:  {
				id:       true,
				location: true,
			},
		},)

		if (nextBooking?.location) {
			const route = await this.bookingRoutesService.getOrCreateRoute({
				fromLat: booking.location.latitude,
				fromLng: booking.location.longitude,
				toLat:   nextBooking.location.latitude,
				toLng:   nextBooking.location.longitude,
				transportation,
			},)

			await this.prisma.bookingRoute.create({
				data: {
					bookingId: nextBooking.id,
					duration:  route.duration,
					distance:  route.distance,
					polyline:  route.polyline,
				},
			},)
		}
	}

	public async createBookingDraftAndReturnRedirectUrl(data: DraftBookingDto,): Promise<{ url: string; id : string }> {
		await this.throwErrorIfBookingIsNotAvailable(data.selectedProductsGroups,)

		const bookingDraft = await this.bookingDraftService.createDraftBooking(data,)

		const {officeId, b2bClientId,} = data

		let paymentPreferencesNew: PaymentPreference | null = null
		if (officeId) {
			paymentPreferencesNew = await this.officeService.getPaymentPreferencesByOfficeId(officeId,)
		}

		if (paymentPreferencesNew === PaymentPreference.INVOICES) {
			const newBooking  = await this.createBooking({
				...data,
				clientType:     EClientType.B2B,
				clientId:       b2bClientId,
				officeId,
				booking_status: BookingStatus.BOOKED,
			},)

			return {
				url:       `${this.configService.getOrThrow('LANDING_REDIRECT_URL',)}/new-booking/successful-payment?invoiced=true`,
				id:        newBooking.id,
			}
		}

		// if (newBooking.b2BClientsId) {
		// 	return {
		// 		url:       `${this.frontendUrl}/bookings`,
		// 		bookingId: newBooking.id,
		// 	}
		// }

		const { url,} = await this.createBookingDraftPayment({
			bookingDraftId: bookingDraft.id,
		},)

		return {
			url,
			id: bookingDraft.id,
		}
	}

	public async getBookingPaymentSession(bookingGroupId: string,): Promise<{ url: string }> {
		const booking = await this.prisma.bookingGroup.findFirst({
			where: {
				id: bookingGroupId,
			},
			select: {
				id:             true,
			},
		},)

		if (!booking) {
			throw new HttpException('Booking not found', 404,)
		}

		const {id : sessionId,} = await this.createNewBookingPayment(bookingGroupId,)

		if (sessionId) {
			const session = await this.stripeService.getCheckoutSessionById(sessionId,)
			if (session.payment_status === 'paid') {
				await this.updateBookingsInGroup(bookingGroupId, { booking_status: BookingStatus.BOOKED, },)
				return {
					url: this.stripeService.successUrl,
				}
			}
			if (session.payment_status === 'unpaid' && session.url) {
				return {
					url: session.url,
				}
			}

			const { url, } = await this.createNewBookingPayment(bookingGroupId,)

			return {
				url,
			}
		}

		const { url, } = await this.createNewBookingPayment(bookingGroupId,)

		return {
			url,
		}
	}

	public async handleLikeMaterial(
		body: VoteBookingDto,
	): Promise<{ message: string; likeCount: number; dislikeCount: number }> {
		const { userId, materialId, voteType, materialType, } = body

		if (!materialId) {
			throw new Error('Material ID is required',)
		}

		const voteTable =
      materialType === 'RAW' ?
      	'rawMaterialVote' :
      	'editedMaterialVote'

		// @ts-ignore
		const existingVote = await this.prisma[voteTable].findFirst({
			where: {
				userId,
				materialId,
			},
		},)

		let likeCount = 0
		let dislikeCount = 0

		if (existingVote) {
			if (existingVote.voteType === voteType) {
				// @ts-ignore

				await this.prisma[voteTable].delete({
					where: {
						id: existingVote.id,
					},
				},)
				// @ts-ignore
				likeCount = await this.prisma[voteTable].count({
					where: {
						materialId,
						voteType: 'LIKE',
					},
				},)
				// @ts-ignore

				dislikeCount = await this.prisma[voteTable].count({
					where: {
						materialId,
						voteType: 'DISLIKE',
					},
				},)

				return { message: 'Vote removed', likeCount, dislikeCount, }
			}

			// @ts-ignore

			await this.prisma[voteTable].update({
				where: {
					id: existingVote.id,
				},
				data: {
					voteType,
				},
			},)
			// @ts-ignore

			likeCount = await this.prisma[voteTable].count({
				where: {
					materialId,
					voteType: 'LIKE',
				},
			},)
			// @ts-ignore

			dislikeCount = await this.prisma[voteTable].count({
				where: {
					materialId,
					voteType: 'DISLIKE',
				},
			},)

			return { message: 'Vote updated', likeCount, dislikeCount, }
		}
		// @ts-ignore

		await this.prisma[voteTable].create({
			data: {
				userId,
				materialId,
				voteType,
			},
		},)
		// @ts-ignore

		likeCount = await this.prisma[voteTable].count({
			where: {
				materialId,
				voteType: 'LIKE',
			},
		},)
		// @ts-ignore

		dislikeCount = await this.prisma[voteTable].count({
			where: {
				materialId,
				voteType: 'DISLIKE',
			},
		},)

		return { message: 'Vote created', likeCount, dislikeCount, }
	}

	public async changeHeroShoot(materialId: string,) {
		const material = await this.prisma.editedMaterial.findFirst({
			where: { id: materialId, },
		},)

		if (!material) {
			throw new Error('Material not found',)
		}

		const { bookingId, } = material

		if (material.isHeroShoot) {
			await this.prisma.editedMaterial.update({
				where: { id: materialId, },
				data:  { isHeroShoot: false, },
			},)
		} else {
			await this.prisma.editedMaterial.updateMany({
				where: { bookingId, isHeroShoot: true, },
				data:  { isHeroShoot: false, },
			},)

			await this.prisma.editedMaterial.update({
				where: { id: materialId, },
				data:  { isHeroShoot: true, },
			},)
		}
	}

	private async detectClientType(clientId: string,) {
		const b2cClient = await this.prisma.b2CClients.findFirst({
		  where: { id: clientId, },
		},)

		if (b2cClient) {
		  return EClientType.B2C
		}

		const b2BClient = await this.prisma.b2BClients.findFirst({
		  where: { id: clientId, },
		},)

		if (b2BClient) {
		  return EClientType.B2B
		}

		const workerClient = await this.prisma.worker.findFirst({
			where: {id: clientId,},
		},)

		if (workerClient) {
			return EClientType.WORKER
		}

		return ''
	  }

	  private async getWorkerDashboardBookings(workerId:string, where:Prisma.BookingWhereInput,) {
		const workerOffices = await this.prisma.workerOnOffice.findMany({
			where: {
			  worker_id: workerId,
			},
			select: {
			  office_id: true,
		  },},)
		const officeIds = workerOffices.map((assignment,) => {
			return assignment.office_id
		},)
		const officeWhere:Prisma.BookingWhereInput = {
			AND: [
				{
					officeId: {
						in: officeIds,
					},
				},
			],
		}

		const bookings = await this.prisma.booking.findMany({
			where: {
				...officeWhere,
				...where,
			},
			include: {
				editedMaterial:       true,
				rawMaterial:          true,
				office:               true,
				BookingToProductType: {
					include: {
						productType: {
							include: {
								productTypeSkills: {
									include: {
										skill: true,
									},
								},
							},
						},
					},
				},
				BookingStageHistory: {
					orderBy: {
						timestamp: 'asc',
					},
				},
			},
		},)

		return bookings
	  }

	public async getUpcomingBookings(clientId:string,query:GetBookingsDto,): Promise<PagedResDto<BookingClientListDto>> {
		const clientType = await this.detectClientType(clientId,) as unknown as EClientType

		const {officeIds,} = query

		let bookings :Array<IBookingWithAllInfo & {uniqueSkills:Array<SkillDto>}> = []

		const commonBookingWhere :Prisma.BookingWhereInput = {
			// editedMaterial: {
			// 	none: {},
			// },
			...basicBookingClientWhere,
			officeId: {
				in: officeIds,
			},
			booking_status: {
				notIn: [BookingStatus.CANCELED, BookingStatus.DONE, BookingStatus.AWAITING_PAYMENT,],
			},
		}

		if (clientType === EClientType.B2C || clientType === EClientType.B2B) {
			bookings = await this.bookingGroupService.getBookingsForClient({
				where: {
					OR: [
						{
							b2CClientsId: clientId,
						},
						{
							b2BClientsId: clientId,
						},
					],
				},
				include: {
					bookings: {
						where:   commonBookingWhere,
						include: {
							...IncludeAllBookingInfo,
							BookingStageHistory: true,
						},
					},
				},
				skip: query.skip,
				take: query.take,

			},)
		}

		const totalCount = await this.bookingGroupService.getBookingsForClientCount({
			OR: [
				{
					b2CClientsId: clientId,
				},
				{
					b2BClientsId: clientId,
				},
			],
		},
		)

		if (clientType === EClientType.WORKER) {
			bookings = await this.workerService.getBookingsForWorker({
				bookingWhere:   commonBookingWhere,
				workerId:       clientId,
				bookingInclude: {
					...IncludeAllBookingInfo,
					BookingStageHistory: true,
				},
				take: query.take,
				skip: query.skip,
			},)
		}

		return {
			data:    bookings.map((booking,) => {
				return BookingClientListDto.cast(booking,)
			},),
			hasNext: totalCount > query.skip + query.take,
		}
	}

	public async getDeliveredBookings(clientId:string,query :GetBookingsDto,):Promise<PagedResDto<BookingClientListDto>> {
		const clientType = await this.detectClientType(clientId,) as unknown as EClientType

		let bookings :Array<IBookingWithAllInfo & {uniqueSkills:Array<SkillDto>}> = []
		const {officeIds,} = query

		const commonBookingWhere :Prisma.BookingWhereInput = {
			// editedMaterial: {
			// 	none: {},
			// },
			...basicBookingClientWhere,
			booking_status: {
				equals: BookingStatus.DONE,
			},
			officeId: {
				in: officeIds,
			},
		}

		if (clientType === EClientType.B2C || clientType === EClientType.B2B) {
			bookings = await this.bookingGroupService.getBookingsForClient({
				where: {
					OR: [
						{
							b2CClientsId: clientId,
						},
						{
							b2BClientsId: clientId,
						},
					],
				},
				include: {
					bookings: {
						where:   commonBookingWhere,
						include: {
							...IncludeAllBookingInfo,
							BookingStageHistory: true,
						},
					},
				},
				skip: query.skip,
				take: query.take,

			},)
		}

		const totalCount = await this.bookingGroupService.getBookingsForClientCount({
			OR: [
				{
					b2CClientsId: clientId,
				},
				{
					b2BClientsId: clientId,
				},
			],
		},
		)

		if (clientType === EClientType.WORKER) {
			bookings = await this.workerService.getBookingsForWorker({
				bookingWhere:   commonBookingWhere,
				workerId:       clientId,
				bookingInclude: {
					...IncludeAllBookingInfo,
					BookingStageHistory: true,
				},
				take: query.take,
				skip: query.skip,
			},)
		}

		const bookingWithMaterial = await Promise.all(bookings.map(async(booking,) => {
			const hasMaterial = await this.bookingGroupService.getBookingMaterial(booking.id,)
			return BookingClientListDto.cast(booking,hasMaterial,)
		},),)

		return {
			data:    bookingWithMaterial,
			hasNext: totalCount > query.skip + query.take,
		}
	}

	public async uploadAllFiles(groupedPhotos:Array<IProcessedPhoto>,) {
		for (const photo of groupedPhotos) {
			const uploadsDir = path.resolve(
				__dirname,
				'..',
				'..',
				'..',
				'..',
				'..',
				'uploads',
			)
			if (photo.file) {
				const filePath = path.join(uploadsDir,photo.file.filename,)

				const uploadResult = await this.uploadService.uploadLocalFileToS3(
					filePath,
					photo.file.originalname,
				)

				photo.mainPhoto = uploadResult.url
			}

			if (photo.exapmlePhotos) {
				const uploadedExamplePhotos: Array<string> = []

				const uploadPromises = photo.exapmlePhotos.map(async(examplePhoto,) => {
					const filePath = path.join(uploadsDir, typeof examplePhoto === 'string' ?
						examplePhoto :
						examplePhoto.filename,)
				  const url = await this.uploadService.uploadLocalFileToS3(filePath, typeof examplePhoto === 'string' ?
						examplePhoto :
						examplePhoto.filename,)
				  return url.url
				},)
				const urls = await Promise.all(uploadPromises,)

				urls.forEach((url,) => {
					return uploadedExamplePhotos.push(url,)
				},)

				photo.exapmlePhotos = urls
			  }
		}

		return groupedPhotos
	}

	public async updateBookingCGI(groupedFiles:Array<IProcessedPhoto>,bookingId:string,): Promise<void> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where: {
				id: bookingId,
			},
			include: {
				bookings: {
					where: {
						BookingToProductType: {
							some: {
								productType: {
									productTypeSkills: {
										some: {
											skill: {
												name: 'CGI',
											},
										},
									},
								},
							},
						},
					},
					include: {
						...SelectBookingSkills,
					},
				},
			},
		},)

		const bookingCGI = bookingGroup?.bookings
			.map((booking,) => {
				return booking.id
			},)

		const photosToSave = groupedFiles.flatMap((photo,) => {
			return bookingCGI?.map((it,) => {
				return {
					mainPhoto:     photo.mainPhoto,
					description:   photo.description,
					roomType:      photo.roomType,
					examplePhotos: Array.isArray(photo.exapmlePhotos,) ?
						photo.exapmlePhotos.map((file,) => {
							return (typeof file === 'string' ?
								file :
								file.filename)
						},) :
						[],
					bookingId: it,
				}
			},) ?? []
		},
		)

		await this.prisma.bookingCGIClientPhotos.createMany({
			data: photosToSave,
		},)
	}

	public async updateBookingDraftCGI(groupedFiles:Array<IProcessedPhoto>,bookingDraftId:string,) {
		const bookingDraft = await this.bookingDraftService.getDraftBooking(bookingDraftId,)
		if (!bookingDraft) {
			throw new NotFoundException('Draft are not found!',)
		}
		await this.bookingDraftService.updateDraftBooking(bookingDraftId, {
			...bookingDraft,
			groupedFiles: [
				...(bookingDraft.groupedFiles ?? []),
				...groupedFiles,
			],
		},)
	}

	public async createNewBookingReview(
		data: CreateReviewDto,
		bookingGroupId: string,
	): Promise<BookingReview> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where:  { id: bookingGroupId, },
			select: {
				bookings: {
					select: {
						id:           true,
						contractorId: true,
					},
				},
			},
		},)

		if (!bookingGroup || bookingGroup.bookings.length === 0) {
			throw new NotFoundException('Booking group not found or empty',)
		}

		const { bookings, } = bookingGroup

		if (!bookings.every((b,) => {
			return b.contractorId
		},)) {
			throw new NotFoundException('Some bookings are missing contractor information',)
		}

		const createdReviews: Array<BookingReview> = []

		await Promise.all(
			bookings.map(async({ id, contractorId, },) => {
				const review = await this.reviewService.createReview({
					comment:   data.comment ?? '',
					rating:    data.rating,
					bookingId: id,
				},)

				createdReviews.push(review,)

				if (!contractorId) {
					throw new NotFoundException('Contractor ID not found',)
				}

				const averageRating = await this.reviewService.getAverageRating(contractorId,)

				await this.prisma.contractor.update({
					where: { id: contractorId, },
					data:  { rating: averageRating, },
				},)
			},),
		)
		return createdReviews[0]!
	}

	public async updateBookingByGroupId(bookingGroupId: string, data: ChangeBookingDto,): Promise<Booking | null> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where: { id: bookingGroupId, },
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		const bookings = await this.prisma.booking.findMany({
			where: { bookingGroupId, },
		},)

		if (bookings.length === 0) {
			throw new NotFoundException('Booking not found',)
		}

		await this.prisma.booking.updateMany({
			where: { bookingGroupId, },
			data,
		},)

		const firstBooking = await this.prisma.booking.findFirst({
			where: { bookingGroupId, },
		},)

		return firstBooking
	}

	public async createBookingFromDraft(draftId: string, paymentIntent?: string,): Promise<BookingGroup> {
		const draft = await this.bookingDraftService.getDraftBooking(draftId,)

		if (!draft) {
			throw new NotFoundException('Draft are not found!',)
		}

		let clientId = ''
		const oldClient = await this.clientB2CService.getClientByEmail(draft.contactInformation.email,)

		if (oldClient) {
			clientId = oldClient.id
		} else {
			const client = await this.clientB2CService.addClient({
				email:       draft.contactInformation.email,
				firstName:   draft.contactInformation.name,
				lastName:    draft.contactInformation.surname,
				phoneNumber: draft.contactInformation.phone,
				address:     '',
			},)
			clientId = client.id
		}

		const bookingGroup = await this.createBooking(
			{
				...draft,
				clientId,
				clientType:          EClientType.B2C,
				booking_status:      BookingStatus.BOOKED,
				stripePaymentIntent: paymentIntent,
			},
		)

		if (draft.groupedFiles) {
			await this.updateBookingCGI(draft.groupedFiles, bookingGroup.id,)
		}
		return bookingGroup
	}

	public async getBookingInfoByGroupId(bookingGroupId: string,):Promise<BookingClientDetailsDto> {
		const booking = await this.bookingGroupService.getBookingInfo(bookingGroupId,)

		return BookingClientDetailsDto.cast(booking,)
	}

	public async createAdditionalBookingFlow(body: CreateAdditionalBookingDto,): Promise<any> {
		const { bookingGroupId, photos, } = body

		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where:   { id: bookingGroupId, },
			include: {
				bookings: true,
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		const { totalSum, productTypes, } = await this.productService.getAdditionalPriceForPhotos(photos,)

		const { id,bookings,createdAt, ...rest } = bookingGroup

		const newBookingGroup = await this.prisma.bookingGroup.create({
			data: {
				...rest,
				sumOfPrices: totalSum,
				createdAt:   new Date(),
			},
		},)

		const esoftContractor = await this.prisma.contractor.findUnique({
			where: {
				email: 'esoft@mail.com',
			},
		},)

		if (!esoftContractor) {
			throw new NotFoundException('Contractor not found',)
		}

		const { id: bookingId,created_at, ...restBooking } = bookings[0]!

		const newBooking = await this.prisma.booking.create({
			data: {
				...restBooking,
				bookingType:        BookingType.ORDER,
				booking_status:     BookingStatus.AWAITING_PAYMENT,
				contractorId:       esoftContractor.id,
				total_sum:          totalSum.toString(),
				bookingGroupId:     newBookingGroup.id,
				floorplanChecklist: {},
				created_at:         new Date(),
			},
		},)

		const productTypeNames = productTypes.map((productType,) => {
			return productType.productType.name
		},)

		await Promise.all(productTypes.map(async(productType,) => {
			await this.prisma.bookingToProductType.create({
				data: {
					bookingId:     newBooking.id,
					productTypeId: productType.productTypeId,
					isAdditional:  true,
				},
			},)
		},),)

		const additionalRawMaterials = await this.prisma.rawMaterial.findMany({
			where: {
				id: {
					in: photos.map((photo,) => {
						return photo.id
					},),
				},
			},
		},)

		await this.bookingMaterialService.uploadMaterials(newBooking.id, {
			contentType:  MaterialTypeContent.PHOTOS,
			rawType:      MaterialRawType.RAW,
			rawMaterials: additionalRawMaterials.map((rawMaterial,) => {
				return {
					url:      rawMaterial.url,
					name:     rawMaterial.name,
					fileSize: rawMaterial.fileSize ?? 0,
				}
			},),
		},)

		await this.bookingMaterialService.deleteAdditionalMaterials(additionalRawMaterials.map((rawMaterial,) => {
			return rawMaterial.id
		},),)

		return {
			id: newBookingGroup.id,
			productTypeNames,
			totalSum,
		}
	}

	public async createAdditionalBooking(body: CreateAdditionalBookingDto,): Promise<any> {
		const {id, productTypeNames, totalSum, } = await this.createAdditionalBookingFlow(body,)

		const { url, } = await this.stripeService.createCheckoutSessionWithFixedPrice({
			price:     totalSum,
			bookingId: id,
			name:      productTypeNames.join(', ',),
			couponId:  body.couponId,
		},)

		return {
			url,
			id,
		}
	}

	public async processAdditionalBooking(bookingGroupId: string,): Promise<void> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where:   { id: bookingGroupId, },
			include: {
				bookings: true,
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		const booking = bookingGroup.bookings[0]!

		await this.editMaterialService.editMaterials(booking.id, true,)
	}

	public async getAdditionalBookingCheckoutInfo(bookingGroupId: string, query: GetAdditionalBookingCheckoutDto,): Promise<AdditionalPhotoCheckoutDto> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where:   { id: bookingGroupId, },
			include: {
				b2BClients: true,
				b2CClients: true,
				worker:     true,
				bookings:   true,
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		const { photos = [], } = query

		const additionalPhotos = await this.prisma.rawMaterial.findMany({
			where: {
				id: {
					in: photos.map((photo,) => {
						return photo.id
					},),
				},
			},
		},)

		if (additionalPhotos.length !== photos.length) {
			throw new NotFoundException('Some photos are not found',)
		}

		const { totalSum, priceByPhotoCount, } = await this.productService.getAdditionalPriceForPhotos(photos,)

		return AdditionalPhotoCheckoutDto.cast(bookingGroup, totalSum, priceByPhotoCount, additionalPhotos,)
	}

	public async cancelBooking(bookingGroupId: string,): Promise<void> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where:  { id: bookingGroupId, },
			select: {
				id:                  true,
				stripePaymentIntent: true,
				sumOfPrices:         true,
				bookings:            {
					select: {
						id:        true,
						date_time: true,
					},
				},
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		const { stripePaymentIntent, sumOfPrices, bookings, } = bookingGroup

		await this.stripeService.refundBooking(stripePaymentIntent!, sumOfPrices * 100,)

		await this.updateBookingsByGroup(bookingGroupId, {
			booking_status: BookingStatus.CANCELED,
		},)
	}

	public async checkIfSomeBookingIsNotPaid(clientId: string,): Promise<boolean> {
		const EXPIRED_DAYS = 60
		const expiryDate = new Date()
		expiryDate.setDate(expiryDate.getDate() - EXPIRED_DAYS,)

		const clientType = await this.clientBasicService.getClientTypeById(clientId,)

		if (!clientType) {
			throw new NotFoundException('Client not found',)
		}

		if (clientType === ClientType.B2C) {
			return false
		}

		const bookingGroupsExpiredCount = await this.prisma.bookingGroup.count({
		  where: {
				isPaid:     false,
				invoicedAt: {
			  lt: expiryDate,
				},
				b2BClientsId: clientId,
		  },
		},)

		return bookingGroupsExpiredCount > 0
	  }
}