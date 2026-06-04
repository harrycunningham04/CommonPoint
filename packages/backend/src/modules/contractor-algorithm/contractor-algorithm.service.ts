import { BadRequestException, Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { InvoiceClientService, } from '../invoice/services/invoice-client.service'
import { BookingGroupService, } from '../booking-group/booking-group.service'
import { EngagementLevel, } from '../booking-group/booking-group.types'
import type { GetValidContractorsDto, GetValidContractorsForNewClientDto, GetValidContractorsWithCoordsDto, } from './dtos/get-valid-contractors.dto'
import { ClientsB2CService, } from '../clients/services/b2c.service'
import { OfficeService, } from '../clients/services/office.service'
import { getContractorScores, } from './contractor-algorithm.utils'
import { ContractorStatisticCalculationService, } from '../statistic-tracking/services/contractor-statistic-calculation.service'
import { ContractorAvailabilityWithBookingService, } from '../booking/services/booking-contractor-location.service'
import type { ContractorSlotsResArray, IContractorSlotRes, MapContractorBookedAndAvailableSlots, MapContractorBookedAndAvailableSlotsDayWithWayAndTime, MapContractorSlotsRes, } from '../booking/booking.types'
import { endOfDay, format, startOfDay, } from 'date-fns'
import { RegionService, } from '../regions/services/client-region.service'

@Injectable()
export class ContractorAlgorithmService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly invoiceClientService: InvoiceClientService,
		private readonly bookingGroupService: BookingGroupService,
		private readonly clientsB2CService: ClientsB2CService,
		private readonly officeService: OfficeService,
		private readonly contractorStatisticCalculationService: ContractorStatisticCalculationService,
		private readonly contractorAvailabilityWithBookingService: ContractorAvailabilityWithBookingService,
		private readonly regionService: RegionService,
	) {}

	public async getB2CClientEngagementLevel(id: string, additionalData?: {
		address: string,
		productTypeIds: Array<string>,
	},): Promise<EngagementLevel> {
		const amountOfOrders = await this.prisma.bookingGroup.count({
			where: {
				b2CClientsId: id,
			},
		},)

		if (amountOfOrders === 0) {
			return EngagementLevel.B2C_FIRST_ORDER
		}

		if (!additionalData) {
			return EngagementLevel.B2C_NOT_THE_FIRST_ORDER
		}

		const bookingGroup = await this.prisma.bookingGroup.findFirst({
			where: {
				b2CClientsId: id,
				bookings:     {
					every: {
						address:              additionalData.address,
						BookingToProductType: {
							every: {
								productTypeId: { in: additionalData.productTypeIds, },
							},
						},
					},
				},
			},
		},)

		if (bookingGroup) {
			return EngagementLevel.B2C_RETURNED_ORDER
		}

		return EngagementLevel.B2C_NOT_THE_FIRST_ORDER
	}

	public async getB2BClientEngagementLevel(officeId: string,): Promise<EngagementLevel> {
		const amountOfOrders = await this.prisma.bookingGroup.count({
			where: {
				officeId,
			},
		},)

		if (amountOfOrders <= 5) {
			return EngagementLevel.B2B_NEW
		}

		if (await this.invoiceClientService.getIsLastInvoiceMoreThen60Days(officeId,)) {
			return EngagementLevel.B2B_NEW
		}

		if (await this.bookingGroupService.getIsLowVolumeBrand(officeId,)) {
			return EngagementLevel.B2B_LOW_VOLUME
		}

		return EngagementLevel.B2B_RETURNING
	}

	public async getEngagementLevel(userId?: string, additionalData?: {
		address: string,
		productTypeIds: Array<string>,
	},): Promise<{ engagementLevel: EngagementLevel, isOffice: boolean}> {
		if (!userId) {
			return {
				engagementLevel: EngagementLevel.B2C_FIRST_ORDER,
				isOffice:        false,
			}
		}

		const isB2C = await this.clientsB2CService.checkClientById(userId,)
		if (isB2C) {
			return {
				engagementLevel: await this.getB2CClientEngagementLevel(userId, additionalData,),
				isOffice:        false,
			}
		}

		const isOffice = await this.officeService.checkOfficeById(userId,)
		if (isOffice) {
			return {
				engagementLevel: await this.getB2BClientEngagementLevel(userId,),
				isOffice:        true,
			}
		}

		throw new BadRequestException('User not found',)
	}

	public async getThreeNearestContractorsForBooking(dto: GetValidContractorsWithCoordsDto,): Promise<MapContractorBookedAndAvailableSlots> {
		let userId = dto.userIdOrOfficeId
		if (dto.email && !userId) {
			const client = await this.clientsB2CService.getClientByEmail(dto.email,)
			userId = client?.id
		}

		const startDate = startOfDay(dto.startDate,)
		const endDate = endOfDay(dto.endDate,)

		// process engagement level and scores
		const {engagementLevel, isOffice,} = await this.getEngagementLevel(userId,)
		const orderValueLevel = await this.bookingGroupService.getOrderValueLevel({id: userId, isOffice, sumOfCurrentOrder: dto.orderSum,},)
		const isPriority = isOffice ?
			await this.officeService.getIsPriorityOffice(userId,) :
			await this.clientsB2CService.getIsPriorityClient(userId,)
		const scores = getContractorScores({
			engagementLevel,
			valueLevel: orderValueLevel,
			isPriority,
		},)

		const regionId = await this.regionService.getRegionIdByCoordinates([dto.longitude, dto.latitude,],)

		// step 1 and 2
		const contractorIds = await this.contractorStatisticCalculationService.getRelevantContractorIds({
			scores,
			skip:           0,
			take:           20,
			skillName:      dto.skillName,
			regionId,
			productTypeIds: dto.productTypeIds ?? [],
		},)

		console.log(contractorIds, 'contractorIds',)

		// step 3 and 4
		const contractorsBookedAndAvailableSlots = await this.contractorAvailabilityWithBookingService.getContractorsBookedAndAvailableSlots({
			contractorIds,
			startDate,
			endDate,
			durationInMinutes: dto.durationInMinutes + 30,
			bookedSlots:       dto.bookedSlots,
			basicLocation:     {
				latitude:  dto.latitude,
				longitude: dto.longitude,
			},
		},)

		// step 5
		const contractorsHomeLocation = await this.contractorAvailabilityWithBookingService.getContractorsHomeLocationIfNeeded({contractors: contractorsBookedAndAvailableSlots,},)

		const nearestContractors = await this.contractorAvailabilityWithBookingService.getThreeNearestContractors({
			contractorsSlots: contractorsBookedAndAvailableSlots,
			contractorsHomeLocation,
			basicLocation:    {
				latitude:  dto.latitude,
				longitude: dto.longitude,
			},
		},)

		return nearestContractors
	}

	private async specifyContractorSlots(
		availability: MapContractorBookedAndAvailableSlotsDayWithWayAndTime,
		workDurationMinutes: number,
	): Promise<MapContractorSlotsRes> {
		const contractorSlots: MapContractorSlotsRes = new Map()
		const INTERVAL_MINUTES = 30
		const MINUTES_IN_HOUR = 60

		// helper function to round up to nearest 15 minutes
		const roundUpTo15Minutes = (minutes: number,): number => {
			return Math.ceil(minutes / INTERVAL_MINUTES,) * INTERVAL_MINUTES
		}

		// helper function to round down to nearest 15 minutes
		const roundDownTo15Minutes = (minutes: number,): number => {
			return Math.floor(minutes / INTERVAL_MINUTES,) * INTERVAL_MINUTES
		}

		for (const [contractorId, contractorAvailability,] of availability.entries()) {
			contractorAvailability.forEach((day,) => {
				const dayOfMonth = format(day.dateTime, 'dd',)
				const dayOfWeek = format(day.dateTime, 'EEEE',)
				const formattedDate = `${dayOfWeek} ${dayOfMonth}`

				day.slots.forEach((slot,) => {
					if (!slot.isAvailable || slot.isBooked) {
						return
					}

					const slotStartMinutes = (slot.from.getHours() * MINUTES_IN_HOUR) + slot.from.getMinutes()
					const slotEndMinutes = (slot.to.getHours() * MINUTES_IN_HOUR) + slot.to.getMinutes()

					const travelToLocationMinutes = Math.ceil(slot.timeFromPreviousLocation,)
					const travelFromLocationMinutes = slot.timeToNextLocation ?
						Math.ceil(slot.timeToNextLocation,) :
						0

					// total time needed including travel and work
					const totalTimeNeeded = workDurationMinutes + travelToLocationMinutes + travelFromLocationMinutes

					// check if we have enough time in this slot
					const availableMinutes = slotEndMinutes - slotStartMinutes
					if (availableMinutes < totalTimeNeeded) {
						return
					}

					// calculate earliest possible start after travel and round up to next 15 minutes
					const earliestPossibleStartMinutes = roundUpTo15Minutes(slotStartMinutes + travelToLocationMinutes,)
					// calculate latest possible end before next travel and round down to previous 15 minutes
					const latestPossibleEndMinutes = roundDownTo15Minutes(slotEndMinutes,)

					// generate possible start times at 15-minute intervals
					for (
						let startMinute = earliestPossibleStartMinutes;
						startMinute + workDurationMinutes <= latestPossibleEndMinutes;
						startMinute = startMinute + INTERVAL_MINUTES
					) {
						const daySlots = contractorSlots.get(formattedDate,)

						const endMinute = roundUpTo15Minutes(startMinute + workDurationMinutes,)

						const startHours = Math.floor(startMinute / MINUTES_IN_HOUR,)
							.toString()
							.padStart(2, '0',)
						const startMins = Math.floor(startMinute % MINUTES_IN_HOUR,)
							.toString()
							.padStart(2, '0',)
						const endHours = Math.floor(endMinute / MINUTES_IN_HOUR,)
							.toString()
							.padStart(2, '0',)
						const endMins = Math.floor(endMinute % MINUTES_IN_HOUR,)
							.toString()
							.padStart(2, '0',)

						const startTime = new Date(day.dateTime,)
						startTime.setHours(Number(startHours,), Number(startMins,), 0, 0,)

						const endTime = new Date(day.dateTime,)
						endTime.setHours(Number(endHours,), Number(endMins,), 0, 0,)

						const possibleSlot = {
							contractorIds:         [contractorId,],
							startTime,
							endTime,
							timeToCurrentLocation: slot.timeFromPreviousLocation,
							timeToNextLocation:    slot.timeToNextLocation,
						}

						if (daySlots) {
							const searchedSlot = daySlots.find((it,) => {
								return it.startTime.getHours() === possibleSlot.startTime.getHours() && it.startTime.getMinutes() === possibleSlot.startTime.getMinutes()
							},)

							if (searchedSlot) {
								const uniqueContractorIds = new Set([...searchedSlot.contractorIds, contractorId,],)
								contractorSlots.set(formattedDate, [...daySlots.map((it,) => {
									if (it.startTime.getHours() === possibleSlot.startTime.getHours() && it.startTime.getMinutes() === possibleSlot.startTime.getMinutes()) {
										const maxTimeToCurrentLocation = Math.max(it.timeToCurrentLocation, possibleSlot.timeToCurrentLocation,)
										const maxTimeToNextLocation = it.timeToNextLocation && possibleSlot.timeToNextLocation ?
											Math.max(it.timeToNextLocation, possibleSlot.timeToNextLocation,) :
											it.timeToNextLocation ?? possibleSlot.timeToNextLocation
										return {
											...it,
											timeToCurrentLocation: maxTimeToCurrentLocation,
											timeToNextLocation:    maxTimeToNextLocation,
											contractorIds:         Array.from(uniqueContractorIds,),
										}
									}
									return it
								},),],)
								continue
							}

							contractorSlots.set(formattedDate, [...daySlots, possibleSlot,],)
							continue
						}

						contractorSlots.set(formattedDate, [possibleSlot,],)
					}
				},)
			},)
		}

		return contractorSlots
	}

	public async getThreeNearestContractorsWithAvailability(dto: GetValidContractorsForNewClientDto,): Promise<ContractorSlotsResArray> {
		const basicLocation = await this.contractorAvailabilityWithBookingService.getBasicLocationFromAddress({
			address: dto.address,
		},)

		const threeNearestContractors = await this.getThreeNearestContractorsForBooking({...dto, latitude: basicLocation.latitude, longitude: basicLocation.longitude,},)

		const availableSlotsWithWayAndTime = await this.contractorAvailabilityWithBookingService.findOnlyAvailableSlotsWithWayAndTime({
			contractorsSlots: threeNearestContractors,
			basicLocation,
		},)

		const specifiedContractorSlots = await this.specifyContractorSlots(availableSlotsWithWayAndTime, dto.durationInMinutes,)
		console.log('specifiedContractorSlots', specifiedContractorSlots,)
		specifiedContractorSlots.forEach((slots,) => {
			console.table(slots,)
		},)
		const objectFromEntries = Object.fromEntries(specifiedContractorSlots.entries(),)

		const sortedObjectFromEntries = Object.fromEntries(Object.entries(objectFromEntries,).map(([day, slots,],) => {
			return [day, slots.sort((a, b,) => {
				return a.startTime.getTime() - b.startTime.getTime()
			},),]
		},)
			.sort(([dayA, slotsA,], [dayB, slotsB,],) => {
				if (slotsA instanceof Array && slotsB instanceof Array) {
					return (slotsA.at(0,)?.startTime.getTime() ?? 0) - (slotsB.at(0,)?.startTime.getTime() ?? 0)
				}
				return 0
			},),)

		return sortedObjectFromEntries
	}

	private addDays(date: Date, days: number,): Date {
		const newDate = new Date(date,)
		newDate.setDate(newDate.getDate() + days,)
		return newDate
	}

	public async getThreeFirstSlots(dto: GetValidContractorsForNewClientDto,): Promise<Array<IContractorSlotRes>> {
		const resultSlots: Array<IContractorSlotRes> = []
		const maxAmountOfSlots = 3
		const ONE_MONTH_IN_DAYS = 30

		const basicDto = {...dto,}

		const lastCheckingDate = new Date(dto.startDate,)
		lastCheckingDate.setDate(lastCheckingDate.getDate() + ONE_MONTH_IN_DAYS,)
		while (resultSlots.length < maxAmountOfSlots) {
			// eslint-disable-next-line no-await-in-loop
			const allSlots = await this.getThreeNearestContractorsWithAvailability(basicDto,)
			Object.values(allSlots,).forEach((slot,) => {
				if (resultSlots.length >= maxAmountOfSlots) {
					return
				}
				const firstSlot = slot.at(0,)
				if (firstSlot) {
					resultSlots.push(firstSlot,)
				}
			},)

			if (basicDto.startDate > lastCheckingDate) {
				break
			}

			basicDto.startDate = this.addDays(basicDto.endDate, 1,)
			basicDto.endDate = this.addDays(basicDto.endDate, 6,)
		}

		return resultSlots
	}
}
