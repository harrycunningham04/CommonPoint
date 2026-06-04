/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
/* eslint-disable max-lines */
import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common'
import { ContractorSkillNama,} from '@prisma/client'
import type { Prisma,} from '@prisma/client'
import type { Contractor, ContractorListColumns, ContractorStatisticsColums, Skills, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import { CryptoService, } from 'src/modules/crypto/crypto.service'
import { ContractorBasicResDto,} from '../dto/get-contractors.dto'
import type { FilterDto, GetContractorsDto, } from '../dto/get-contractors.dto'
import type { IContractor, IContractorCalendarListReturn, IContractorListReturn, IContractorStatistics, } from '../contractor.types'
import { MailService, } from 'src/modules/mail/mail.service'
import { ConfigService, } from '@nestjs/config'
import { addMonths, differenceInMinutes, differenceInWeeks, endOfWeek, millisecondsToHours, startOfWeek, } from 'date-fns'
import type { ChangeContractorDto, } from '../dto/change-contractor.dto'
import type { CreateSkillDto, } from '../dto/create-skill-contractor.dto'
import { getCoordinatesFromAddress, } from 'src/shared/utils/coordinates-util'
import { MapService, } from 'src/modules/map/map.service'
import type { DirectionsResponseData, LatLng, TravelMode, } from '@googlemaps/google-maps-services-js'
import { getMinutesTime, } from 'src/shared/utils/date-calculations.util'
import type { ContractorDto, } from '../dto/contractor.dto'
import { GetContractorAssignDto, } from '../dto/contractor-assign-list.dto'
import type { PageSearchDto,} from 'src/shared/dto/page-options.dto'
import { AvailabilityService, } from 'src/modules/availability/availability.service'
import { BookingDetailContractorDto, } from 'src/modules/booking/dto/booking-admin-detaIls.dto'
import { ContractorResponseDto, } from '../dto/contractor-response.dto'
import { Template, templateDictionary } from 'src/modules/mail/types/template.enum'
@Injectable()
export class ContractorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cryptoService: CryptoService,
		private readonly mailService: MailService,
		private readonly mapService: MapService,
		private readonly configService: ConfigService,
		private readonly availabilityService: AvailabilityService,
	) {
		this.generateIfNotExistListColumns()
		this.generateIfNotExistStitisticsColumns()
	}

	public async generateIfNotExistListColumns(): Promise<void> {
		const count = await this.prisma.contractorListColumns.count()
		if (count < 1) {
			await this.prisma.contractorListColumns.create({},)
		}
	}

	public async generateIfNotExistStitisticsColumns(): Promise<void> {
		const count = await this.prisma.contractorStatisticsColums.count()
		if (count < 1) {
			await this.prisma.contractorStatisticsColums.create({},)
		}
	}

	public async changePasswordByAdminId(userId: string, newPassword: string,): Promise<Contractor> {
		const password = await this.cryptoService.hashString(newPassword,)

		return this.prisma.contractor.update({
			where: {
				id: userId,
			},
			data: {
				password,
			},
		},)
	}

	public async addContractor(data: Prisma.ContractorCreateInput,): Promise<ContractorResponseDto> {
		const isExist = await this.prisma.contractor.findFirst({
			where: {
				email: data.email,
			},
		},)
		if (isExist) {
			throw new BadRequestException('Email already in use',)
		}

		const generatedPassword = this.cryptoService.generateRandomPassword(12,)

		const password = await this.cryptoService.hashString(generatedPassword,)

		const newAdmin = await this.prisma.contractor.create({
			data: {
				...data,
				password,
			},
		},)

		await this.mailService.sendEmailWithTemplate(Template.BASIC, {
			clickLondonUrl:       `${this.configService.getOrThrow('CONTRACTOR_REDIRECT_URL',)}/login` ,
			email:                newAdmin.email,
			unsubscribeUrl:       '',
			managePreferencesUrl: '',
			message:              templateDictionary[Template.BASIC].message,
			password:             generatedPassword,
		}, {
			to:      newAdmin.email,
			subject: 'Contractor Credentials',
		},)

		return ContractorResponseDto.cast(newAdmin,)
	}

	public getContractorFilterWhere(filter: FilterDto | undefined,): Prisma.ContractorWhereInput {
		const filterWhere: Prisma.ContractorWhereInput = {
			onSite: true,
		}

		if (filter) {
			const { archived, active, mark, rating, transportations, region,skills, } = filter
			if (mark) {
				const numberedMark = mark.map((it,) => {
					return Number.parseInt(it, 10,)
				},)
				Object.assign(filterWhere, {
					mark: {
						in: numberedMark,
					},
				},)
			}
			if (transportations && transportations.length > 0) {
				Object.assign(filterWhere, {
					transportation: {
						in: transportations,
					},
				},)
			}
			if (active && active.length < 2) {
				const [booleanedActive,] = active.map((it,) => {
					return it === 'true'
				},)
				Object.assign(filterWhere, {
					active: {
						not: !booleanedActive,
					},
				},)
			}
			if (rating) {
				const [min, max,] = rating.map((it,) => {
					return Number.parseInt(it, 10,)
				},)
				Object.assign(filterWhere, {
					rating: {
						gte: min,
						lte: max,
					},
				},)
			}
			if (archived) {
				const booleanArchived = archived === 'true'

				// console.log('ARCHIVED',)

				if (!booleanArchived) {
					Object.assign(filterWhere, {
						archived: {
							not: !booleanArchived,
						},
					},)
				}
			}

			if (region && region.length > 0) {
				Object.assign(filterWhere, {
					regions: {
						some: {
							regionId: {
								in: region,
							},
						},
					},
				},)
			}

			if (skills && skills.length > 0) {
				const enumValues = Object.values(ContractorSkillNama,)
				const skillNames = skills
					.filter((name,): name is ContractorSkillNama => {
						return enumValues.includes(name as ContractorSkillNama,)
					},)

				if (skillNames.length > 0) {
					Object.assign(filterWhere, {
						AND: skillNames.map((name,) => {
							return {
								skills: {
									some: {
										confirmed: true,
										skill:     {
											is: {
												name,
											},
										},
									},
								},
							}
						},),
					},)
				}
			}
		}

		return filterWhere
	}

	private buildContractorSearchConditions(search: string,): Prisma.ContractorWhereInput['OR'] {
		const searchConditions: Prisma.ContractorWhereInput['OR'] = [
			{ name: { contains: search, mode: 'insensitive', }, },
			{ surname: { contains: search, mode: 'insensitive', }, },
			{ address: { contains: search, mode: 'insensitive', }, },
			{ email: { contains: search, mode: 'insensitive', }, },
			{ phone: { contains: search, mode: 'insensitive', }, },
		]

		// handle name and surname combinations
		const searchTerms = search.trim().split(/\s+/,)
		if (searchTerms.length >= 2) {
			const firstName = searchTerms[0]
			const lastName = searchTerms[searchTerms.length - 1]

			// add condition for first name in name field and last name in surname field
			searchConditions.push({
				AND: [
					{ name: { contains: firstName, mode: 'insensitive', }, },
					{ surname: { contains: lastName, mode: 'insensitive', }, },
				],
			},)

			// add condition for last name in name field and first name in surname field (reverse order)
			searchConditions.push({
				AND: [
					{ name: { contains: lastName, mode: 'insensitive', }, },
					{ surname: { contains: firstName, mode: 'insensitive', }, },
				],
			},)
		}

		return searchConditions
	}

	public async filteredContractors(data: GetContractorsDto,): Promise<IContractorListReturn> {
		const { page, limit, search, filter, } = data
		const numberedPage = Number.parseInt(page, 10,)
		const numberedLimit = Number.parseInt(limit, 10,)
		const skip = (numberedPage - 1) * numberedLimit

		const whereFilter = this.getContractorFilterWhere(filter,)
		const listColumns = await this.getContractorListColumns()
		const select = this.mapListColumnsIntoSelect(listColumns,)

		let orderBy: Prisma.ContractorOrderByWithRelationInput = {}
		if (filter?.sortBy) {
			if (filter.sortBy === 'alphabetic') {
				orderBy = { name: filter.sortDirection! as Prisma.SortOrder, }
			} else if (filter.sortBy === 'mark') {
				orderBy = { mark: filter.sortDirection! as Prisma.SortOrder, }
			} else {
				orderBy = { rating: filter.sortDirection! as Prisma.SortOrder, }
			}
		}

		const where: Prisma.ContractorWhereInput = {
			...whereFilter,
			OR: [
				...(whereFilter.OR ?? []),
				...this.buildContractorSearchConditions(search ?? '',)!,
			],
		}

		// isBookable if there are some available day in the next month
		let contractors = await this.prisma.contractor.findMany({
			where,
			orderBy,
			skip,
			take:   numberedLimit,
			select: {
				...select,
				regions: {
					select: {
						isHome: true,
						region: {
							select: {
								name:   true,
							},
						},
					},
				},
				skills: {
					include: {
						skill: true,
					},
				},
				availableDays: {
					where: {
						date_time: {
							gte: new Date(),
							lte: addMonths(new Date(), 1,),
						},
					},
				},
			},
		},)

		if (filter?.sortBy === 'mark') {
			contractors = contractors.sort((a, b,) => {
				if (a.mark === null) {
					return 1
				}
				if (b.mark === null) {
					return -1
				}
				return 0
			},)
		}

		const totalCount = await this.prisma.contractor.count({
			where,
		},)

		const maxPage = Math.ceil(totalCount / numberedLimit,)

		// map region names to an array of strings for each contractor
		const contractorsWithRegionNames: Array<ContractorResponseDto> = contractors.map((contractor,) => {
			return ContractorResponseDto.cast(contractor,)
		},)
		return {
			contractors: contractorsWithRegionNames,
			maxPage:     maxPage === 0 ?
				1 :
				maxPage,
		}
	}

	public async filteredCalendarContractors(data: GetContractorsDto,): Promise<IContractorCalendarListReturn> {
		const { page, limit, search, filter, } = data
		const numberedPage = Number.parseInt(page, 10,)
		const numberedLimit = Number.parseInt(limit, 10,)
		const skip = (numberedPage - 1) * numberedLimit

		const filterWhere = this.getContractorFilterWhere(filter,)

		let orderBy: Prisma.ContractorOrderByWithRelationInput = {}
		if (filter?.sortBy) {
			if (filter.sortBy === 'alphabetic') {
				orderBy = { name: filter.sortDirection! as Prisma.SortOrder, }
			} else if (filter.sortBy === 'mark') {
				orderBy = { mark: filter.sortDirection! as Prisma.SortOrder, }
			} else {
				orderBy = { rating: filter.sortDirection! as Prisma.SortOrder, }
			}
		}

		const where: Prisma.ContractorWhereInput = {
			...filterWhere,
			OR: [
				{
					Booking: {
						some: {
							OR: [
								{ address: { contains: search, mode: 'insensitive', }, },
								{
									b2CClients: {
										OR: [
											{ firstName: { contains: search, mode: 'insensitive', }, },
											{ lastName: { contains: search, mode: 'insensitive', }, },
											{ address: { contains: search, mode: 'insensitive', }, },
											{ phoneNumber: { contains: search, mode: 'insensitive', }, },
											{
												AND: [
													{ firstName: { contains: search?.split(' ',)[0], mode: 'insensitive', }, },
													{ lastName: { contains: search?.split(' ',)[1], mode: 'insensitive', }, },
												],
											},
										],
									},
								},
							],
						},
					},
				},
			],
		}

		if (search) {
			where.OR = [
				...(where.OR ?? []),
				...this.buildContractorSearchConditions(search,)!,
			]
		}

		let contractors = await this.prisma.contractor.findMany({
			where,
			orderBy,
			skip,
			take:    numberedLimit,
			include: {
				skills: {
					include: {
						skill: true,
					},
				},
				Booking: {
					include: {
						b2CClients: true,
					},
				},
			},
		},)

		if (filter?.sortBy === 'mark') {
			contractors = contractors.sort((a, b,) => {
				if (a.mark === null) {
					return 1
				}
				if (b.mark === null) {
					return -1
				}
				return 0
			},)
		}

		const totalCount = await this.prisma.contractor.count({
			where,
		},)

		const maxPage = Math.ceil(totalCount / numberedLimit,)

		return {
			contractors,
			maxPage:     maxPage === 0 ?
				1 :
				maxPage,
		}
	}

	public async exportContractors(data: GetContractorsDto, listColumns: ContractorListColumns,): Promise<Array<Contractor>> {
		const { search, filter, } = data
		const filterWhere = this.getContractorFilterWhere(filter,)
		const select = this.mapListColumnsIntoSelectCsv(listColumns,)

		let orderBy: Prisma.ContractorOrderByWithRelationInput = {}
		if (filter?.sortBy) {
			if (filter.sortBy === 'alphabetic') {
				orderBy = { name: filter.sortDirection! as Prisma.SortOrder, }
			} else if (filter.sortBy === 'mark') {
				orderBy = { mark: filter.sortDirection! as Prisma.SortOrder, }
			} else {
				orderBy = { rating: filter.sortDirection! as Prisma.SortOrder, }
			}
		}

		const where: Prisma.ContractorWhereInput = {
			...filterWhere,
			OR: [
				{ name: { contains: search, mode: 'insensitive', }, },
				{ surname: { contains: search, mode: 'insensitive', }, },
				{ address: { contains: search, mode: 'insensitive', }, },
				{ email: { contains: search, mode: 'insensitive', }, },
				{ phone: { contains: search, mode: 'insensitive', }, },
			],
		}

		const contractors = await this.prisma.contractor.findMany({
			where,
			orderBy,
			select,
		},)

		return contractors
	}

	public async changeContractor(
		id: string,
		data: Prisma.ContractorUpdateInput & ChangeContractorDto,
	): Promise<ContractorResponseDto> {
		try {
			if (data.regionNames && data.regionNames.length > 0) {
				await this.prisma.contractorRegion.deleteMany({
					where: {
						contractorId: id,
					},
				},)

				await Promise.all(data.regionNames.map(async(regionName, index,) => {
					let region = await this.prisma.region.findFirst({
						where: { name: regionName, },
					},)
					if (!region) {
						region = await this.prisma.region.create({ data: { name: regionName, }, },)
					}
					return this.prisma.contractorRegion.create({
						data: { contractorId: id, regionId: region.id, isHome: index === 0, },
					},)
				},),)
			}
			const contractor = await this.prisma.contractor.update({
				where: { id, },
				data:  {
					email:          data.email,
					archived:       data.archived,
					rating:         data.rating,
					active:         data.active,
					radius:         data.radius,
					priority:       data.priority,
					name:           data.name,
					surname:        data.surname,
					phone:          data.phone,
					password:       data.password,
					avatar:         data.avatar,
					address:        data.address,
					mark:           data.mark,
					postCode:       data.postCode,
					portfolio:      data.portfolio,
					transportation: data.transportation,
				},
				include: {
					skills: {
						include: {
							skill: true,
						},
					},
					regions: {
						include: {
							region: true,
						},
					},
					equipments: true,
				},
			},)

			return ContractorResponseDto.cast(contractor,)
		} catch (error) {
			console.error('Error updating contractor:', error,)
			throw error
		}
	}

	public async changeListColumns(body: Prisma.ContractorListColumnsUpdateInput,): Promise<ContractorListColumns> {
		const listColumns = await this.getContractorListColumns()
		const updated = await this.prisma.contractorListColumns.update({
			where: {
				id: listColumns.id,
			},
			data: body,
		},)

		return updated
	}

	public async changeStatisticsColumns(body: Prisma.ContractorStatisticsColumsUpdateInput,): Promise<ContractorStatisticsColums> {
		const statisticsColumns = await this.getContractorStatisticsColumns()
		const updated = await this.prisma.contractorStatisticsColums.update({
			where: {
				id: statisticsColumns.id,
			},
			data: body,
		},)

		return updated
	}

	public async getContractorListColumns(): Promise<ContractorListColumns> {
		const listColumns = await this.prisma.contractorListColumns.findFirst()

		return listColumns!
	}

	public async getContractorStatisticsColumns(): Promise<ContractorStatisticsColums> {
		const statisticsColumns = await this.prisma.contractorStatisticsColums.findFirst()

		return statisticsColumns!
	}

	public mapListColumnsIntoSelect(options: ContractorListColumns,): Prisma.ContractorSelect {
		const { status: active, type: onSite, ...rest } = options
		const select: Prisma.ContractorSelect = {
			id:             true,
			created_at:     true,
			updated_at:     true,
			name:           true,
			surname:        true,
			archived:       true,
			avatar:         true,
			transportation: true,
			mark:           true,
			priority:       true,
			phone:          true,
			email:          true,
			postCode:       true,
			portfolio:      true,
			address:        true,
			regions:        true,
			radius:         true,
		}

		if (active) {
			Object.assign(select, { active: true, },)
		}

		if (onSite) {
			Object.assign(select, { onSite: true, },)
		}

		Object.keys(rest,).forEach((key,) => {
			if (rest[key as keyof typeof rest]) {
				Object.assign(select, { [key]: true, },)
			}
		},)

		return select
	}

	public mapListColumnsIntoSelectCsv(options: ContractorListColumns,): Prisma.ContractorSelect {
		// eslint-disable-next-line no-unused-vars
		const { status: active, id: _id, ...rest } = options
		const select: Prisma.ContractorSelect = {
			name:     true,
			surname:  true,
			archived: true,
		}

		if (active) {
			Object.assign(select, { active: true, },)
		}

		Object.keys(rest,).forEach((key,) => {
			if (rest[key as keyof typeof rest]) {
				Object.assign(select, { [key]: true, },)
			}
		},)

		return select
	}

	public async getContractorRoutes(contractorId: string, travelMode: TravelMode,): Promise<DirectionsResponseData | undefined> {
		const contractor = await this.prisma.contractor.findFirst({
			where: {
				id: contractorId,
			},
			include: {
				Booking: true,
			},
		},)
		const waypoints = await Promise.all(
			(contractor?.Booking ?? []).sort(
				(a, b,) => {
					const firstTimeInMinutesA = getMinutesTime(a.duration ?? 0,)
					const firstTimeInMinutesB = getMinutesTime(b.duration ?? 0,)
					return firstTimeInMinutesA - firstTimeInMinutesB
				},
			).map(async(booking,) => {
				const waypoint = await getCoordinatesFromAddress(booking.address ?? '',)
				if (!waypoint) {
					return null
				}
				return waypoint
			},),
		).then((results,) => {
			return results.filter(Boolean,)
		},) as Array<LatLng>

		return this.mapService.getRoutes(waypoints, travelMode,)
	}

	public async contractorStatistics(contractorId: string,): Promise<IContractorStatistics> {
		const photoSLA = await this.getContractorPhotoSLA()
		const sketchSLA = await this.getContractorSketchSLA()
		const contentSLA = await this.getContractorContentSLA()
		const floorplanSLA = await this.getContractorFloorplanSLA()
		const earning = await this.getContractorEarning()
		const avgComplRate = await this.getContractorAvgComplRate()
		const avgPhotoCapture = await this.getContractorAvgPhotoCapture()
		const avgJobPerWeek = await this.getContractorAvgJobPerWeek()
		const totalJobsDone = await this.getContractorTotalJobsDone()
		const howOftenOnTime = await this.getContractorHowOftenOnTime()

		return {
			contractorId,
			howOftenOnTime,
			photoSLA,
			sketchSLA,
			contentSLA,
			floorplanSLA,
			earning,
			avgComplRate,
			avgJobPerWeek,
			avgPhotoCapture,
			totalJobsDone,
		}
	}

	public async getContractorHowOftenOnTime(): Promise<number> {
		// toDo: get orders and find out diff calc start time and actual stirt time
		const orders = [
			{ name: 'first order', startDate: '2024-04-14T10:55:08.309Z', endDate: '2024-04-17T14:55:08.309Z', actualStartTime: '2024-04-14T11:55:08.309Z', },
			{ name: 'more orders', startDate: '2024-04-28T10:55:08.309Z', endDate: '2024-05-02T14:55:08.309Z', actualStartTime: '2024-04-28T10:55:08.309Z', },
			{ name: 'last order', startDate: '2024-05-12T10:55:08.309Z', endDate: '2024-05-17T14:55:08.309Z', actualStartTime: '2024-05-12T10:55:08.309Z', },
		]

		const onTimeOrders = orders.filter((order,) => {
			const calculatedStart = new Date(order.startDate,)
			const actualStart = new Date(order.actualStartTime,)
			const difference = differenceInMinutes(actualStart, calculatedStart,)
			return difference <= 5
		},).length

		const totalOrders = orders.length

		const onTimePercentage = (onTimeOrders / totalOrders) * 100

		return onTimePercentage
	}

	public async getContractorPhotoSLA(): Promise<number> {
		// toDo: count all the photos and count how many photos were taken before 20:00
		const totalPhotos = 12
		const photosTakenBefore20 = 11
		return (photosTakenBefore20 / totalPhotos) * 100
	}

	public async getContractorSketchSLA(): Promise<number> {
		// todo: count all orders and count all uploaded sketches
		const orders = [
			{ name: 'first order', startDate: '2024-04-14T10:55:08.309Z', endDate: '2024-04-17T14:55:08.309Z', },
			{ name: 'more orders', startDate: '2024-04-28T10:55:08.309Z', endDate: '2024-05-02T14:55:08.309Z', },
			{ name: 'last order', startDate: '2024-05-12T10:55:08.309Z', endDate: '2024-05-17T14:55:08.309Z', },
		]
		const totalOrders = orders.length
		const uploadedSketches = 1
		return (uploadedSketches / totalOrders) * 100
	}

	public async getContractorContentSLA(): Promise<number> {
		// toDo: get diff between star/end date and divide by total orders
		// sELECT AVG(UNIX_TIMESTAMP(endDate) - UNIX_TIMESTAMP(startDate))
		const orders = [
			{ name: 'first order', startDate: '2024-04-14T10:55:08.309Z', endDate: '2024-04-17T14:55:08.309Z', },
			{ name: 'more orders', startDate: '2024-04-28T10:55:08.309Z', endDate: '2024-05-02T14:55:08.309Z', },
			{ name: 'last order', startDate: '2024-05-12T10:55:08.309Z', endDate: '2024-05-17T14:55:08.309Z', },
		]
		const totalCount = orders.length

		const totalTime = orders.reduce((sum, order,) => {
			const startDate = new Date(order.startDate,).getTime()
			const endDate = new Date(order.endDate,).getTime()
			return sum + (endDate - startDate)
		}, 0,)

		const totalHours = millisecondsToHours(totalTime,)
		const averageTime = totalHours / totalCount
		return averageTime
	}

	public async getContractorFloorplanSLA(): Promise<number> {
		return 12
	}

	public async getContractorEarning(): Promise<number> {
		return 300
	}

	public async getContractorAvgComplRate(): Promise<number> {
		const orders = [
			{ name: 'first order', startDate: '2024-04-14T10:55:08.309Z', endDate: '2024-04-14T16:55:08.309Z', },
			{ name: 'more orders', startDate: '2024-04-28T10:55:08.309Z', endDate: '2024-04-28T17:55:08.309Z', },
			{ name: 'last order', startDate: '2024-05-13T10:55:08.309Z', endDate: '2024-05-13T14:55:08.309Z', },
		]
		const totalCount = orders.length

		const totalTime = orders.reduce((sum, order,) => {
			const startDate = new Date(order.startDate,).getTime()
			const endDate = new Date(order.endDate,).getTime()
			return sum + (endDate - startDate)
		}, 0,)

		const totalHours = millisecondsToHours(totalTime,)
		const averageTime = totalHours / totalCount
		return averageTime
	}

	public async getContractorAvgPhotoCapture(): Promise<number> {
		// toDo: count finished photos per order, use prisma avg

		const photosAvg = 24

		return photosAvg
	}

	public async getContractorAvgJobPerWeek(): Promise<number> {
		// toDo: get all orders by contractorId(if length equals 0 return 0)
		// find date of first order and date of last, and count how many weeks
		// divide
		const orders = [
			{ name: 'first order', startDate: '2024-04-14T10:55:08.309Z', endDate: '2024-04-17T14:55:08.309Z', },
			{ name: 'more orders', startDate: '2024-04-28T10:55:08.309Z', endDate: '2024-05-02T14:55:08.309Z', },
			{ name: 'last order', startDate: '2024-05-12T10:55:08.309Z', endDate: '2024-05-17T14:55:08.309Z', },
		]

		const firstOrderDate = orders.reduce(
			(minDate, order,) => {
				return (order.startDate < minDate ?
					order.startDate :
					minDate)
			},
			orders[0]!.startDate,
		)

		const lastOrderDate = orders.reduce(
			(maxDate, order,) => {
				return (order.startDate > maxDate ?
					order.startDate :
					maxDate)
			},
			orders[0]!.startDate,
		)

		const totalWeeks = differenceInWeeks(endOfWeek(lastOrderDate,), startOfWeek(firstOrderDate,),)
		const totalOrders = orders.length

		const averageOrdersPerWeek = totalOrders / totalWeeks

		return averageOrdersPerWeek
	}

	public async getContractorTotalJobsDone(): Promise<number> {
		// toDo: count all jobs where status completed
		const completedJobsCount = 3
		return completedJobsCount
	}

	public async getSingleContractor(contractorId: string,): Promise<ContractorDto | null> {
		return this.prisma.contractor.findUnique({
			where: {
				id: contractorId,
			},
		},)
	}

	public async getContractorRegionsData() {
		const regions = await this.prisma.region.findMany({
			where: {
				contractorRegions: {
					some: {},
				},
			},
			select: {
				id:   true,
				name: true,
			},
		},)

		return regions
	}

	public async createContractorSkill(contractorId: string, data: CreateSkillDto,) {
		const { skillName, } = data

		let skill: Skills | null = await this.prisma.skills.findFirst({ where: { name: skillName, }, },)

		if (!skill) {
			skill = await this.prisma.skills.create({ data: { name: skillName!, icon: '', }, },)
		}

		const contractorSkill = await this.prisma.contractorSkills.create({
			data: {
				contractor_id: contractorId,
				skill_id:      skill.id,
				confirmed:     false,
			},
		},)

		return {
			contractorSkill,
			skill,
		}
	}

	public async removeContractorSkill(contractorId: string, skillId: string,) {
		await this.prisma.contractorSkills.delete({
			where: {
				contractor_id_skill_id: {
					contractor_id: contractorId,
					skill_id:      skillId,
				},
			},
		},)
	}

	public async getContractorOwnSkill(contractorId: string,) {
		const contractorSkills = await this.prisma.contractorSkills.findMany({
			where: {
				contractor_id: contractorId,
			},
			include: {
				skill: true,
			},
		},)

		const skillsContractor = contractorSkills.map((skills,) => {
			return skills.skill
		},)

		return skillsContractor
	}

	public async  getContractorLocation(contractorId: string,) {
		const contractorLocation  = await this.prisma.contractor.findFirst({
			where: {
				id: contractorId,
			},
			select: {
				ContractorLocation: true,
			},
		},)

		return contractorLocation
	}

	public async getContractorAssignList(query : PageSearchDto,): Promise<Array<GetContractorAssignDto>> {
		const {search, isOffSite,} = query

		let filter: Prisma.ContractorWhereInput = {}
		if (isOffSite) {
			filter = {
				onSite: false,
			}
		}

		if (!isOffSite) {
			filter = {
				onSite: true,
			}
		}

		if (search) {
			filter.OR = [
				{ name: { contains: search, mode: 'insensitive', }, },
				{ surname: { contains: search, mode: 'insensitive', }, },
			]
		}

		const contractorData = await this.prisma.contractor.findMany({
			where: {
				...filter,
			},
			select: {
				id:      true,
				name:    true,
				surname: true,
				avatar:  true,
				phone:   true,
				onSite:  true,
			},
		},)

		return contractorData.map((contractorData,) => {
			return new GetContractorAssignDto({
				id:      contractorData.id,
				name:    contractorData.name,
				surname: contractorData.surname,
				avatar:  contractorData.avatar ?? '',
				phone:   contractorData.phone ?? '',
				onSite:  contractorData.onSite,
			},)
		},)
	}

	public async getContractorBasicInfo(contractorId: string,): Promise<ContractorBasicResDto> {
		const contractor = await this.prisma.contractor.findUnique({
			where: {
				id: contractorId,
			},
			select: {
				name:    true,
				surname: true,
				avatar:  true,
				rating:  true,
			},
		},)

		if (!contractor) {
			throw new NotFoundException('Contractor not found',)
		}

		return new ContractorBasicResDto({
			name:    contractor.name,
			surname: contractor.surname,
			avatar:  contractor.avatar ?? '',
			rating:  contractor.rating,
		},)
	}

	public async getContractorAssignAll(): Promise<Array<BookingDetailContractorDto>> {
		const contractorData = await this.prisma.contractor.findMany({
			select: {
				id:      true,
				name:    true,
				surname: true,
				avatar:  true,
				phone:   true,
				onSite:  true,
			},
		},)

		return contractorData.map((contractorData,) => {
			return new BookingDetailContractorDto({
				id:       contractorData.id,
				fullName: `${contractorData.name} ${contractorData.surname}`,
				phone:    contractorData.phone ?? '',
				avatar:   contractorData.avatar ?? '',
				onSite:   contractorData.onSite,
			},)
		},)
	}

	public async getContractorById(id: string,): Promise<ContractorResponseDto> {
		const contractor = await this.prisma.contractor.findUnique({
			where: {
				id,
			},
			include: {
				ContractorLocation: true,
				skills:             {
					include: {
						skill: true,
					},
				},
				regions:            {
					include: {
						region: true,
					},
				},
				equipments:       true,
			},
		},)

		if (!contractor) {
			throw new NotFoundException('Contractor not found',)
		}

		return ContractorResponseDto.cast(contractor,)
	}
}
