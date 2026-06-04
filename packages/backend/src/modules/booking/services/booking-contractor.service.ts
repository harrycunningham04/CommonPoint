/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/promise-function-async */
import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { FilterContractorBookingDto, } from '../dto/get-contractor-booking.dto'
import { GetContractorBookingDto, } from '../dto/get-contractor-booking.dto'
import type { Booking, ContractorTransportation, RawMaterial,} from '@prisma/client'
import { BookingStage, BookingStatus, ContractorSkillNama, EditRequestStatus, MaterialTypeContent, NotificationCategory, NotificationType, NotificationUrgency,  Prisma,} from '@prisma/client'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { endOfDay, startOfDay, } from 'date-fns'
import type { GetJobsLocationDto, } from '../dto/get-jobs-location.dto'
import type { GetRoutesDto, } from 'src/modules/contractor/dto/contractor-routes.dto'
import { MapService, } from 'src/modules/map/map.service'
import { mapTransportationToTravelMode, } from '../utils/transform-transportation'
import type { GetBookingMobileDto, } from '../dto/get-booking-mobile.dto'
import type { JobDtoQuery,} from '../dto'
import { JobDto,} from '../dto'
import { BookingEquipmentResDto, BookingMobileResDto, BookingUniqueSkills, MapInfoDto, } from '../dto'
import { BookingContractorOffsiteWhere, CancellationWhere, IncludeAllBookingInfo, SelectBookingSkills, } from '../booking.const'
import { RawMaterialService, } from 'src/modules/raw-material/raw-material.service'
import { RawMaterialsDto,} from 'src/modules/raw-material/dto/floorplans.dto'
import { FloorplanChecklistDto,} from 'src/modules/raw-material/dto/floorplans.dto'
import { CancellationService, } from 'src/modules/cancellation/cancellation.service'
import type { CreateCancellationDto, } from 'src/modules/cancellation/dto/create-cancellation.dto'
import type { PageSearchOptionsDto, } from 'src/shared/dto/page-options.dto'
import { NotificationService, } from 'src/modules/notifications/services/notification.service'
import { StatisticTrackingService, } from 'src/modules/statistic-tracking/services/statistic-tracking.service'
import { SingleBookingResDto, } from '../dto'
import { UpdateStageAndStatusResDto, } from '../dto/update-booking.dto'
import type { BookingWithLocation, IProductTypeBooking,} from '../booking.types'
import { EContractorChangeStatus, } from '../booking.types'
import { EditMaterialService, } from '../../edit-material/edit-material.service'
import { BookingReviewService, } from './booking-review.service'
import { BookingContractorOffsiteListDto, } from '../dto/booking-contractor-off-site-list.dto'

@Injectable()
export class BookingContractorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mapService: MapService,
		private readonly rawMaterialService: RawMaterialService,
		private readonly cancellationService: CancellationService,
		private readonly notificationService: NotificationService,
		private readonly statisticTrackingService: StatisticTrackingService,
		private readonly editMaterialService: EditMaterialService,
		private readonly bookingReviewService: BookingReviewService,
	) {}

	private getContractorBookingFilter(
		filter: FilterContractorBookingDto,
		showDate: string | undefined,
	): Prisma.BookingWhereInput {
		const filterWhere: Prisma.BookingWhereInput = {}

		const { startDate, endDate, statuses, } = filter

		if (statuses && statuses.length > 0) {
			Object.assign(filterWhere, {
				booking_status: {
					in: statuses,
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

		if (showDate) {
			Object.assign(filterWhere, {
				date_time: {
					gte: startOfDay(new Date(showDate,),),
					lt:  endOfDay(new Date(showDate,),),
				},
			},)
		}

		return filterWhere
	}

	public async getContractorBookings(
		contractorId: string,
		query: GetContractorBookingDto,
	): Promise<PagedResDto<Booking>> {
		const { filter = {}, search, showDate,offSite, } = query
		const pageOptions = new GetContractorBookingDto(query,)
		const { skip, take, } = pageOptions

		let where = this.getContractorBookingFilter(filter, showDate,)

		if (search) {
			where = {
				...where,
				address: {
					contains: search,
					mode:     'insensitive',
				},
			}
		}

		const onSiteWhere : Prisma.BookingWhereInput = {
			...where,
			contractorId,
		}

		const bookings = await this.prisma.booking.findMany({
			where: {
				...onSiteWhere,
				NOT: {
					...CancellationWhere,
				},
				// booking_status: {
				// 	not: BookingStatus.AWAITING_PAYMENT,
				// },
			},
			skip,
			take,
			include: {
				b2BClients:             true,
				b2CClients:             true,
				location:               true,
				EditRequest:            {
					select: {
						id: true,
					},
				},
				BookingCGIClientPhotos: {
					include: { submittedMaterial: {
						include: {
							editRequest: {
								include: {
									editRequestMaterials: true,
								},
							},
						},
					}, },
				},
				...SelectBookingSkills,
			},
			orderBy: {
				orderInContractorList: 'asc',
			},
		},)

		const totalCount = await this.prisma.booking.count({
			where: {
				...where,
				contractorId,
			},
		},)

		return new PagedResDto({
			data:    bookings.map((booking,) => {
				return {
					...booking,
					uniqueSkills: BookingUniqueSkills.getUniqueSkills(booking,),
				}
			},),
			hasNext: totalCount > skip + take,
		},)
	}

	public async getContractorJobMap(contractorId:string,query:GetJobsLocationDto,) {
		const {showDate,} = query
		const jobsLocation = await this.prisma.booking.findMany({
			where: {
				contractorId,
				date_time: {
					gte: startOfDay(new Date(showDate,),),
					lt:  endOfDay(new Date(showDate,),),
				},
			},
			select: {
				id:             true,
				address:        true,
				location:       true,
				booking_status: true,
				date_time:      true,
				duration:       true,
				bookingRoute:   true,
			},
		},)

		const contractorTravelMode = await this.prisma.contractor.findUnique({
			where: {
				id: contractorId,
			},
			select: {
				transportation: true,
			},
		},)

		return {
			jobsLocation,
			routes : '',
		}
	}

	public async getContractorSingleRoutes(query : GetRoutesDto,) {
		const {waypoints, travelMode,} = query

		const routes = await this.mapService.getRoute(waypoints,travelMode,)

		return routes
	}

	private checkLocation(location: {
		latitude: number | null,
		longitude: number | null,
	} | null,): {
		lat: number,
		lng: number,
	} {
		if (!location?.latitude || !location.longitude) {
			return {
				lat: 0,
				lng: 0,
			}
		}
		return {
			lat: location.latitude,
			lng: location.longitude,
		}
	}

	private getEstimatedTimeAndWayString({currentLocation, booking,}: {
		currentLocation: {
			lat: number,
			lng: number,
		},
		booking: {
			id: string,
			location: {
				latitude: number,
				longitude: number,
			} | null,
			contractor: {
				transportation: ContractorTransportation,
			} | null,
			keyLocation: {
				latitude: number,
				longitude: number,
			} | null,
		},
	},): [Promise<number | null>, Promise<number | null>, Promise<string | null>, Promise<string | null>] {
		if (!booking.contractor) {
			return [
				Promise.resolve(null,),
				Promise.resolve(null,),
				Promise.resolve(null,),
				Promise.resolve(null,),
			]
		}

		const ifKeyLocation = booking.keyLocation ?
			this.checkLocation(booking.keyLocation,) :
			this.checkLocation(booking.location,)

		return [
			this.mapService.getEstimatedTime(currentLocation, ifKeyLocation, booking.contractor.transportation,),
			booking.keyLocation ?
				this.mapService.getEstimatedTime(this.checkLocation(booking.keyLocation,), this.checkLocation(booking.location,), booking.contractor.transportation,) :
				Promise.resolve(null,),
			this.mapService.getRouteByCoordinates([
				currentLocation,
				ifKeyLocation,
			], booking.contractor.transportation,),
			booking.keyLocation ?
				this.mapService.getRouteByCoordinates([
					this.checkLocation(booking.keyLocation,),
					this.checkLocation(booking.location,),
				], booking.contractor.transportation,) :
				Promise.resolve(null,),
		]
	}

	private async getClientRatings(clientIds: Array<string>,): Promise<Map<string, number>> {
		const clientRatings = new Map<string, number>()
		if (clientIds.length === 0) {
			return clientRatings
		}

		const clientIdsString = Prisma.join(clientIds.map((id,) => {
			return Prisma.sql`${id}::UUID`
		},), ',',)

		const ratings = await this.prisma.$queryRaw<Array<{
			b2c_id: string | null,
			b2b_id: string | null,
			rating: number,
		}>>`
			SELECT booking."b2CClientsId" as b2c_id, booking."b2BClientsId" as b2b_id, AVG(br.rating)::float as rating
			FROM booking_review as br
			LEFT JOIN "Booking" as booking ON booking.id = br."bookingId"
			WHERE booking."b2CClientsId" IN (${clientIdsString}) OR booking."b2BClientsId" IN (${clientIdsString})
			GROUP BY booking."b2CClientsId", booking."b2BClientsId"
		`

		ratings.forEach((rating,) => {
			const key = SingleBookingResDto.getClientIdFromBookingForMap({
				b2CClientsId: rating.b2c_id,
				b2BClientsId: rating.b2b_id,
			},)
			clientRatings.set(key, rating.rating,)
		},)

		return clientRatings
	}

	public async getBookingsTimeEstimation(bookings: Array<Booking & {
		contractor: {
			transportation: ContractorTransportation,
			ContractorLocation: {
				latitude: number,
				longitude: number,
			} | null,
		} | null,
		location: {
			latitude: number,
			longitude: number,
		} | null,
		keyLocation: {
			latitude: number,
			longitude: number,
		} | null,
	}>,): Promise<Array<{
		id: string,
		estimatedTimeToLocation: number,
		estimatedTimeToKeyLocation?: number,
		wayStringToLocation: string,
		wayStringToKeyLocation?: string,
	}>> {
		return Promise.all(bookings.map(async(booking, index,) => {
			if (!booking.contractor) {
				console.log('NO CONTRACTOR', booking.address,)

				return {
					id:                         '',
					estimatedTime:              0,
					estimatedTimeToLocation:    0,
					wayStringToLocation:        '',
				}
			}

			const currentLocation = index === 0 ?
				this.checkLocation(booking.contractor.ContractorLocation,) :
				this.checkLocation(bookings[index - 1]?.location ?? null,)

			const [estimatedTimeToLocation, estimatedTimeToKeyLocation, wayStringToLocation, wayStringToKeyLocation,] = await Promise.all(
				this.getEstimatedTimeAndWayString({currentLocation, booking,},)
				,)

			console.log(booking.address, estimatedTimeToLocation,)

			return {
				id:                         booking.id,
				estimatedTimeToKeyLocation: estimatedTimeToKeyLocation ?? undefined,
				estimatedTimeToLocation:    estimatedTimeToLocation ?? 0,
				wayStringToKeyLocation:     wayStringToKeyLocation ?? undefined,
				wayStringToLocation:        wayStringToLocation ?? '',
			}
		},),)
	}

	public async getUpdatedBookingsEstimation(
		middle: BookingWithLocation,
		previous?: BookingWithLocation,
		next?: BookingWithLocation,
	): Promise<Array<{
		id: string,
		estimatedTimeToLocation: number,
		estimatedTimeToKeyLocation?: number,
		wayStringToLocation: string,
		wayStringToKeyLocation?: string,
	}>> {
		const result: Array<{
			id: string,
			estimatedTimeToLocation: number,
			estimatedTimeToKeyLocation?: number,
			wayStringToLocation: string,
			wayStringToKeyLocation?: string,
		}> = []

		if (previous) {
			const from = this.checkLocation(previous.location,)
			const to = this.checkLocation(middle.location,)
			const [time, keyTime, way, keyWay,] = await Promise.all(this.getEstimatedTimeAndWayString({
				currentLocation: from,
				booking:         middle,
			},),)

			result.push({
				id:                         middle.id,
				estimatedTimeToLocation:    time ?? 0,
				estimatedTimeToKeyLocation: keyTime ?? undefined,
				wayStringToLocation:        way ?? '',
				wayStringToKeyLocation:     keyWay ?? undefined,
			},)
		}

		if (next) {
			const from = this.checkLocation(middle.location,)
			const [time, keyTime, way, keyWay,] = await Promise.all(this.getEstimatedTimeAndWayString({
				currentLocation: from,
				booking:         next,
			},),)

			result.push({
				id:                         next.id,
				estimatedTimeToLocation:    time ?? 0,
				estimatedTimeToKeyLocation: keyTime ?? undefined,
				wayStringToLocation:        way ?? '',
				wayStringToKeyLocation:     keyWay ?? undefined,
			},)
		}

		return result
	}

	private async getRawMaterials(booking: Array<{
		id: string,
	}>,): Promise<Map<string, Array<RawMaterial>>> {
		const rawMaterials = await this.prisma.rawMaterial.findMany({
			where: {
				bookingId: {
					in: booking.map((booking,) => {
						return booking.id
					},),
				},
				contentType: {
					equals: MaterialTypeContent.SKETCHES,
				},
			},
		},)

		const rawMaterialsMap = new Map<string, Array<RawMaterial>>()
		rawMaterials.forEach((material,) => {
			const key = material.bookingId
			const rawMaterials = rawMaterialsMap.get(key,) ?? []
			rawMaterials.push(material,)
			rawMaterialsMap.set(key, rawMaterials,)
		},)

		return rawMaterialsMap
	}

	public async getContractorBookingsMobile(contractorId: string, query: GetBookingMobileDto,): Promise<Array<BookingMobileResDto>> {
		const { date, endDate, } = query

		const bookings = await this.prisma.booking.findMany({
			where: {
				contractorId,
				date_time: {
					gte: startOfDay(date,),
					lte: endOfDay(endDate ?? date,),
				},
				NOT: {
					...CancellationWhere,
				},
			},
			include: IncludeAllBookingInfo,
			orderBy: {
				date_time: 'asc',
			},
		},)

		const rawMaterialsMap = await this.getRawMaterials(bookings,)

		const clientRatings = await this.getClientRatings(bookings.map((booking,) => {
			return SingleBookingResDto.getClientIdFromBookingForSearch(booking,)
		},),)

		const durations = await this.getBookingsTimeEstimation(bookings,)

		return bookings.map((booking,) => {
			const time = durations.find((duration,) => {
				return duration.id === booking.id
			},)
			const rawMaterials = rawMaterialsMap.get(booking.id,) ?? []
			return new BookingMobileResDto({
				booking: SingleBookingResDto.castToSingleBookingResDto({
					...booking,
					rawMaterial: rawMaterials,
				}, clientRatings,),
				mapInfo: MapInfoDto.cast(time,),
			},)
		},)
	}

	public async getContractorEquipment(contractorId: string, query: GetBookingMobileDto,): Promise<Array<BookingEquipmentResDto>> {
		const { date, endDate, } = query

		const bookings = await this.prisma.booking.findMany({
			where: {
				contractorId,
				date_time: {
					gte: startOfDay(date,),
					lte: endOfDay(endDate ?? date,),
				},
			},
			select: {
				id:      true,
				address: true,
			},
			orderBy: {
				date_time: 'asc',
			},
		},)

		return bookings.map((booking,) => {
			return new BookingEquipmentResDto({
				id:         booking.id,
				address:    booking.address ?? '',
				equipments: [
					'test',
					'test2',
				],
			},)
		},)
	}

	public async checkContractorBooking(contractorId: string, id: string,): Promise<void> {
		const booking = await this.prisma.booking.findFirst({
			where: {
				OR: [
					{
						id,
						contractorId,
					},
					{
						id,
						BookingToProductType: {
							some: {
								productType: {
									additionalProduct: {
										contractorId,
									},
								},
							},
						},
					},
				],
			},
			select: {
				id: true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}
	}

	public async getContractorBooking(contractorId: string, id: string,): Promise<SingleBookingResDto> {
		await this.checkContractorBooking(contractorId, id,)

		const booking = await this.prisma.booking.findFirst({
			where: {
				OR: [
					{
						id,
						contractorId,
					},
					{
						id,
						BookingToProductType: {
							some: {
								productType: {
									additionalProduct: {
										contractorId,
									},
								},
							},
						},
					},
				],
			},
			include: {
				...IncludeAllBookingInfo,
				EditRequest: true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const rawMaterialsMap = await this.getRawMaterials([booking,],)

		const rawMaterials = rawMaterialsMap.get(booking.id,) ?? []

		return SingleBookingResDto.castToSingleBookingResDto({
			...booking,
			rawMaterial: rawMaterials,
		}, new Map(),)
	}

	public async addRawMaterials(contractorId: string, data: RawMaterialsDto, materialType: MaterialTypeContent,): Promise<RawMaterialsDto> {
		await this.checkContractorBooking(contractorId, data.id,)

		await this.rawMaterialService.createOrUpdateRawMaterial(data, materialType,)

		const booking = await this.prisma.booking.findUnique({
			where: {
				id: data.id,
			},
			select: {
				id:          true,
				rawMaterial: true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		return RawMaterialsDto.cast({
			id:          booking.id,
			rawMaterial: booking.rawMaterial,
		},)
	}

	public async addFloorplanChecklist(contractorId: string, data: FloorplanChecklistDto,): Promise<FloorplanChecklistDto> {
		await this.checkContractorBooking(contractorId, data.bookingId,)

		const booking = await this.prisma.booking.update({
			where: { id: data.bookingId, },
			data:  {
				floorplanChecklist: FloorplanChecklistDto.castToRecord(data,),
			},
			select: {
				id:                 true,
				floorplanChecklist: true,
			},
		},)

		return FloorplanChecklistDto.cast(booking.id, booking.floorplanChecklist,)
	}

	public async updateBookingStatus(contractorId: string, id: string, status: BookingStatus,): Promise<void> {
		await this.checkContractorBooking(contractorId, id,)

		if (status === BookingStatus.IN_REVIEW) {
			await this.bookingReviewService.updateEditRequestStatus(id, EditRequestStatus.CLOSED,)
		}

		await this.prisma.booking.update({
			where: {
				id,
			},
			data: {
				booking_status: status,
			},
		},)
	}

	public async updateBookingStage(id: string, stage: BookingStage, date?: Date,): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where:  { id, },
			select: {
				id:            true,
				booking_stage: true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		await Promise.all([
			this.prisma.bookingStageHistory.create({
				data: {
					bookingId: booking.id,
					stage,
					timestamp: date,
				},
			},),
			this.prisma.booking.update({
				where: { id: booking.id, },
				data:  { booking_stage: [
					...booking.booking_stage,
					stage,
				], },
			},),
		],)
	}

	public async cancelBooking(contractorId: string, data: CreateCancellationDto,): Promise<SingleBookingResDto> {
		await this.checkContractorBooking(contractorId, data.bookingId,)
		await this.cancellationService.createOrUpdateCancellation(data,)

		const booking = await this.prisma.booking.findUnique({
			where: {
				id: data.bookingId,
			},
			select: {
				id:            true,
				booking_stage: true,
			},
		},)

		if (booking?.booking_stage.includes(BookingStage.CANCELED,)) {
			throw new BadRequestException('Booking already canceled',)
		}

		await this.prisma.booking.update({
			where: {
				id: data.bookingId,
			},
			data: {
				booking_status: BookingStatus.CANCELED,
				booking_stage:  [
					...(booking?.booking_stage ?? []),
					BookingStage.CANCELED,
				],
			},
		},)

		return this.getContractorBooking(contractorId, data.bookingId,)
	}

	public async searchByCompletedBooking(contractorId: string, query: PageSearchOptionsDto,): Promise<PagedResDto<SingleBookingResDto>> {
		const { search, skip, take, } = query

		const allBookings = await this.prisma.booking.findMany({
			where: {
				contractorId,
				booking_status: BookingStatus.DONE,
				address:        {
					contains: search,
					mode:     'insensitive',
				},
			},
			skip,
			take:    take + 1,
			include: IncludeAllBookingInfo,
			orderBy: {
				date_time: 'desc',
			},
		},)

		const bookings = allBookings.slice(0, take,)

		const rawMaterialsMap = await this.getRawMaterials(bookings,)

		return new PagedResDto({
			data:    bookings.map((booking,) => {
				const rawMaterials = rawMaterialsMap.get(booking.id,) ?? []
				return SingleBookingResDto.castToSingleBookingResDto({
					...booking,
					rawMaterial: rawMaterials,
				}, new Map(),)
			},),
			hasNext: allBookings.length > take,
		},)
	}

	public async reorderJobs(orderIds: Array<string>,) {
		const updatePromises = orderIds.map(
			(id, index,) => {
				return this.prisma.booking.update({
					where: { id, },
					data:  { orderInContractorList: index, },
				},)
			},
		)

		await Promise.all(updatePromises,)
	}

	private async setupBookingStageRes(id: string,): Promise<UpdateStageAndStatusResDto> {
		const booking = await this.prisma.booking.findUnique({
			where:  { id, },
			select: {
				id:                 true,
				booking_status:     true,
				booking_stage:      true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		return new UpdateStageAndStatusResDto({
			id:            booking.id,
			bookingStatus: booking.booking_status,
			bookingStage:  booking.booking_stage,
		},)
	}

	public async completeBooking(contractorId:string, booking:{
		id: string,
		duration: number | null,
		bookingStatus: BookingStatus,
		bookingStage: Array<BookingStage>,
		BookingToProductType: Array<{
			productType: IProductTypeBooking['productType'],
		}>
	}, date?: Date,): Promise<void> {
		const bookingId = booking.id

		const uniqueSkills = BookingUniqueSkills.getUniqueSkills(booking,)
		const isFloorplanAdded = uniqueSkills.some((skill,) => {
			return skill.name === ContractorSkillNama.FLOORPLAN
		},)

		const bookingStatus = isFloorplanAdded ?
			BookingStatus.BOOKED :
			BookingStatus.LEFT_THE_SITE

		await Promise.all([
			this.updateBookingStatus(contractorId, booking.id, bookingStatus,),
			this.updateBookingStage(booking.id, BookingStage.CONTRACTOR_LEFT_THE_SITE, date,),
			this.statisticTrackingService.createRunningOnTimeIfNotExists(contractorId, booking.id,),
			this.statisticTrackingService.createCompletedBookingDurationIfNotExists(contractorId, booking.id, booking.duration ?? 1,),
			this.statisticTrackingService.createBookingDoneIfNotExists(contractorId, bookingId,),
		],)

		if (!isFloorplanAdded) {
			return
		}

		const accuracyPoints = 10

		const floorplanCount = await this.prisma.rawMaterial.count({
			where: {
				bookingId:   booking.id,
				contentType: MaterialTypeContent.SKETCHES,
			},
		},)

		const isHasFloorplan = floorplanCount > 0
		const bookingStage = isHasFloorplan ?
			BookingStage.FLOORPLAN_SKETCH_UPLOADED :
			BookingStage.FLOORPLAN_SKETCH_DECLINED

		await Promise.all([
			this.updateBookingStage(booking.id, bookingStage, date,),
			this.statisticTrackingService.createCompletedBookingWithOrWithoutFloorplanStatus(contractorId, booking.id, isHasFloorplan,),
			this.statisticTrackingService.createBookingFloorplanAccuracyIfNotExists(contractorId, booking.id, accuracyPoints,),
		],)
	}

	private async checkContractorChangeStatus({ booking, status,}:{ booking: {
		id: string,
		bookingStatus: BookingStatus,
		bookingStage: Array<BookingStage>,
		keyLocation: {
			latitude: number,
			longitude: number,
		} | null,
	}, status: EContractorChangeStatus,},): Promise<{
		isContinue: boolean,
	}> {
		if (status === EContractorChangeStatus.KEYS_COLLECTED && !booking.keyLocation) {
			throw new BadRequestException('Key location not specified',)
		}
		if (status === EContractorChangeStatus.KEYS_COLLECTED) {
			return {
				isContinue: !booking.bookingStage.includes(BookingStage.KEYS_COLLECTED,),
			}
		}

		if (status === EContractorChangeStatus.ARRIVED_ON_SITE && booking.keyLocation && !booking.bookingStage.includes(BookingStage.KEYS_COLLECTED,)) {
			throw new BadRequestException('Keys not collected',)
		}

		if (status === EContractorChangeStatus.ARRIVED_ON_SITE) {
			return {
				isContinue: !booking.bookingStage.includes(BookingStage.CONTRACTOR_ARRIVED_ON_SITE,),
			}
		}

		if (status === EContractorChangeStatus.LEFT_THE_SITE && !booking.bookingStage.includes(BookingStage.CONTRACTOR_ARRIVED_ON_SITE,)) {
			throw new BadRequestException('Contractor not arrived on site',)
		}

		if (status === EContractorChangeStatus.LEFT_THE_SITE) {
			return {
				isContinue: !booking.bookingStage.includes(BookingStage.CONTRACTOR_LEFT_THE_SITE,),
			}
		}

		if (!booking.bookingStage.includes(BookingStage.CONTRACTOR_LEFT_THE_SITE,)) {
			throw new BadRequestException('Contractor not left the site',)
		}

		return {
			isContinue: !booking.bookingStage.includes(BookingStage.CONTRACTOR_LEFT_THE_KEYS,),
		}
	}

	public async contractorChangeStatus({ contractorId, bookingId, status, date, }:{contractorId: string, bookingId: string, status: EContractorChangeStatus, date?: Date,},): Promise<UpdateStageAndStatusResDto> {
		await this.checkContractorBooking(contractorId, bookingId,)

		const booking = await this.prisma.booking.findUnique({
			where: {
				id: bookingId,
			},
			select: {
				id:                   true,
				duration:             true,
				booking_stage:        true,
				booking_status:       true,
				keyLocation:          true,
				...SelectBookingSkills,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const { isContinue, } = await this.checkContractorChangeStatus({
			booking: {
				id:            booking.id,
				bookingStatus: booking.booking_status,
				bookingStage:  booking.booking_stage,
				keyLocation:   booking.keyLocation,
			},
			status,
		},)

		if (!isContinue) {
			return this.setupBookingStageRes(bookingId,)
		}

		switch (status) {
		case EContractorChangeStatus.KEYS_COLLECTED:
			await this.updateBookingStage(bookingId, BookingStage.KEYS_COLLECTED, date,)
			break
		case EContractorChangeStatus.ARRIVED_ON_SITE:
			await this.updateBookingStage(bookingId, BookingStage.CONTRACTOR_ARRIVED_ON_SITE, date,)
			break
		case EContractorChangeStatus.LEFT_THE_SITE:
			await this.completeBooking(contractorId, {
				id:                   bookingId,
				duration:             booking.duration,
				bookingStatus:        booking.booking_status,
				bookingStage:         booking.booking_stage,
				BookingToProductType: booking.BookingToProductType,
			}, date,)
			break
		case EContractorChangeStatus.KEYS_RETURNED:
			await this.updateBookingStage(bookingId, BookingStage.CONTRACTOR_LEFT_THE_KEYS, date,)
			break
		default:
			throw new BadRequestException('Invalid status',)
		}

		return this.setupBookingStageRes(bookingId,)
	}

	public async runningLate(bookingId:string, minutes:number,): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where: {
				id: bookingId,
			},
			select: {
				id:            true,
				b2CClientsId:  true,
				b2BClientsId:  true,
				contractorId:  true,
				duration:      true,
				booking_stage: true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		if (!booking.contractorId) {
			throw new NotFoundException('Contractor not assigned to this booking',)
		}

		const notificationItem: Prisma.NotificationCreateInput = {
			title:    'Running Late',
			message:  `The contractor is running late by ${minutes} minutes`,
			type:     NotificationType.CLIENT,
			urgency:  NotificationUrgency.NORMAL,
			category: minutes > 10 ?
				NotificationCategory.CONTRACTOR_RUNNING_LATE_15_MINUTES :
				NotificationCategory.CONTRACTOR_RUNNING_LATE_5_10_MINUTES,
			...(booking.b2CClientsId && {
				b2CClients: {
					connect: {
						id: booking.b2CClientsId,
					},
				},
			}),
			...(booking.b2BClientsId && {
				b2BClients: {
					connect: {
						id: booking.b2BClientsId,
					},
				},
			}),
		}

		await Promise.all([
			this.prisma.booking.update({
				where: { id: bookingId, },
				data:  { runningLate: minutes, },
			},),
			this.notificationService.addNotification(notificationItem,),
			this.statisticTrackingService.createRunningLateIfNotExists(booking.contractorId, bookingId,),
		],)
	}

	public async removeRunningLate(bookingId:string,): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where: {
				id: bookingId,
			},
			select: {
				id:            true,
				b2CClientsId:  true,
				b2BClientsId:  true,
				contractorId:  true,
				duration:      true,
				booking_stage: true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		if (!booking.contractorId) {
			throw new NotFoundException('Contractor not assigned to this booking',)
		}

		const notificationItem: Prisma.NotificationCreateInput = {
			title:    'Running Late',
			message:  'The contractor is not running late',
			type:     NotificationType.CLIENT,
			urgency:  NotificationUrgency.NORMAL,
			category: NotificationCategory.CONTRACTOR_RUNNING_LATE_15_MINUTES,
			...(booking.b2CClientsId && {
				b2CClients: {
					connect: {
						id: booking.b2CClientsId,
					},
				},
			}),
			...(booking.b2BClientsId && {
				b2BClients: {
					connect: {
						id: booking.b2BClientsId,
					},
				},
			}),
		}

		await Promise.all([
			this.prisma.booking.update({
				where: { id: bookingId, },
				data:  { runningLate: null, },
			},),
			this.notificationService.addNotification(notificationItem,),
			this.statisticTrackingService.removeRunningLateIfExists(booking.contractorId, bookingId,),
		],)
	}

	public async markRawMaterialsAsUploaded(contractorId: string, bookingId: string,): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where:  { id: bookingId, },
			select: {
				id:            true,
				...SelectBookingSkills,
				booking_stage: true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		await this.statisticTrackingService.createBookingDoneIfNotExists(contractorId, bookingId,)

		const materialsCount = await this.prisma.rawMaterial.count({
			where: {
				bookingId:   booking.id,
			},
		},)

		await Promise.all([
			this.prisma.bookingStageHistory.create({
				data: {
					bookingId: booking.id,
					stage:     BookingStage.RAW_MATERIALS_UPLOADED,
				},
			},),
			this.prisma.booking.update({
				where: { id: booking.id, },
				data:  { booking_stage: [
					...booking.booking_stage,
					BookingStage.RAW_MATERIALS_UPLOADED,
				], },
			},),
			this.statisticTrackingService.createCompletedBookingPhotoCount(contractorId, booking.id, materialsCount,),
		],)

		await this.editMaterialService.editMaterials(bookingId,)
	}

	public async getContractorOffSite(contractorId: string,): Promise<Array<BookingContractorOffsiteListDto>> {
		const bookings = await this.prisma.booking.findMany({
			where: {
				OR: [
					{
						BookingToProductType: {
							some: {
								productType: {
									additionalProduct: {
										contractorId,
									},
								},
							},
						},
						rawMaterial: {
							some: {
								contentType: MaterialTypeContent.SKETCHES,
							},
						},
					},
					{
						contractorId,
					},
				],
			},
			include: BookingContractorOffsiteWhere,
		},)

		return bookings.map((booking,) => {
			return BookingContractorOffsiteListDto.cast(booking,)
		},)
	}

	public async getContractorJobsAdmin(
		contractorId: string,
		query:JobDtoQuery,
	): Promise<PagedResDto<JobDto>> {
		const { address = '', skip, take, startDate, endDate, withoutCanceled, } = query

		const allBookings = await this.prisma.booking.findMany({
			where: {
				booking_status: withoutCanceled ?
					{
						not: BookingStatus.CANCELED,
					} :
					{},
				address: {
					contains: address,
					mode:     'insensitive',
				},
				date_time: {
					gte: startDate ?? new Date('1970-01-01',),
					lte: endDate ?? new Date('2099-12-31',),
				},
				OR: [
					{
						contractorId,
					},
					{
						BookingToProductType: {
							some: {
								productType: {
									additionalProduct: {
										contractorId,
									},
								},
							},
						},
					},
				],
			},
			skip,
			take:    take + 1,
			orderBy: {
				orderInContractorList: 'asc',
			},
		},)

		const bookings = allBookings.slice(0, take,)

		const contractorJobs = bookings.map((b,) => {
			return JobDto.cast(b,)
		},)

		return {data: contractorJobs,hasNext: allBookings.length > take,}
	}
}