/* eslint-disable @typescript-eslint/promise-function-async */
import { Injectable, } from '@nestjs/common'
import { BasicContractorService, } from 'src/modules/contractor/services/basic-contractor.service'
import { BookingRepository, } from 'src/repositories/booking/booking.repository'
import { MapService, } from 'src/modules/map/map.service'
import { AvailabilityService, } from 'src/modules/availability/availability.service'
import type {  ContractorBookedAndAvailableSlots, ContractorBookedAndAvailableSlotsDay,
	ContractorBookedAndAvailableSlotsDayWithWay,
	IBasicLocation,
	IContractorBookedAndAvailableSlotsSlotWithWay,
	MapContractorBookedAndAvailableSlots,
	MapContractorBookedAndAvailableSlotsDayWithWayAndTime,  } from '../booking.types'
import { ContractorTransportation, } from '@prisma/client'
import type { EditAvailabilityResDto, } from 'src/modules/contractor/dto/edit-availability.dto'
import { getContractorBookedAndAvailableSlots, removeUnnecessarySlots, } from '../utils/contrac-processing'
import { haversineDistance, } from '../utils/location'
import { getFormattedDate, } from '../utils/get-formated-date'
import type { BookedSlotsDto, } from 'src/modules/contractor-algorithm/dtos/get-valid-contractors.dto'
import { offsetDiffHours, } from 'src/shared/utils/moment.util'
import { BookingRoutesService, } from 'src/modules/booking-routes/services/booking-routes.services'
@Injectable()
export class ContractorAvailabilityWithBookingService {
	constructor(
		private readonly basicContractorService: BasicContractorService,
    private readonly bookingRepository: BookingRepository,
		private readonly mapService: MapService,
		private readonly availabilityService: AvailabilityService,
		private readonly bookingRoutesService: BookingRoutesService,
	) {}

	public async getThreeNearestContractors({
		contractorsSlots,
		contractorsHomeLocation,
		basicLocation,
	}: {
		contractorsSlots: MapContractorBookedAndAvailableSlots,
		contractorsHomeLocation: Map<string, {
			latitude: number,
			longitude: number,
		}>,
		basicLocation: {
			latitude: number,
			longitude: number,
		}
	},): Promise<MapContractorBookedAndAvailableSlots> {
		const result = new Map<string, ContractorBookedAndAvailableSlots>()

		const contractorsDistance = new Map<string, number>()

		contractorsSlots.forEach((contractorSlots, contractorId,) => {
			const contractorHomeLocation = contractorsHomeLocation.get(contractorId,)
			if (contractorHomeLocation) {
				const distance = haversineDistance(contractorHomeLocation.latitude, contractorHomeLocation.longitude, basicLocation.latitude, basicLocation.longitude,)
				contractorsDistance.set(contractorId, distance,)
				return
			}
			const firstAvailableDay = contractorSlots.days.find((day,) => {
				return day.slots.some((slot,) => {
					return slot.isAvailable && slot.isBooked
				},)
			},)

			const firstAvailableSlotIndex = firstAvailableDay?.slots.findIndex((slot,) => {
				return slot.isAvailable && !slot.isBooked
			},)
			if (!firstAvailableSlotIndex) {
				contractorsDistance.set(contractorId, Infinity,)
				return
			}
			const firstAvailableSlot = firstAvailableDay?.slots[firstAvailableSlotIndex]
			const previousSlot = firstAvailableDay?.slots[firstAvailableSlotIndex - 1]
			if (firstAvailableSlot && previousSlot?.booking?.location) {
				const distance = haversineDistance(previousSlot.booking.location.latitude, previousSlot.booking.location.longitude, basicLocation.latitude, basicLocation.longitude,)
				contractorsDistance.set(contractorId, distance,)
			} else {
				contractorsDistance.set(contractorId, Infinity,)
			}
		},)

		const sortedContractors = Array.from(contractorsDistance.entries(),).sort((a, b,) => {
			return a[1] - b[1]
		},)

		sortedContractors.forEach(([contractorId,],) => {
			if (result.size >= 3) {
				return
			}

			const contractorSlots = contractorsSlots.get(contractorId,)
			if (contractorSlots) {
				result.set(contractorId, contractorSlots,)
			}
		},)

		return result
	}

	public async getContractorsHomeLocationIfNeeded({
		contractors,
	}: {
		contractors: MapContractorBookedAndAvailableSlots,
	},): Promise<Map<string, {
		latitude: number,
		longitude: number,
	}>> {
		const result = new Map<string, {
			latitude: number,
			longitude: number,
		}>()

		const contractorsIdsForSearch = new Set<string>()

		contractors.forEach((contractorBookedAndAvailableSlots, contractorId,) => {
			const isContractorHomeLocationNeed = contractorBookedAndAvailableSlots.days.at(0,)?.isThisDayStartFromAvailableSlotOrPrevSlotAreNotBooked
			if (isContractorHomeLocationNeed) {
				contractorsIdsForSearch.add(contractorId,)
			}
		},)

		const contractorsHomeLocation = await this.basicContractorService.getContractorLocations(Array.from(contractorsIdsForSearch,),)

		contractorsHomeLocation.forEach((contractorLocation,) => {
			result.set(contractorLocation.contractorId, {
				latitude:  contractorLocation.location?.latitude ?? 0,
				longitude: contractorLocation.location?.longitude ?? 0,
			},)
		},)

		return result
	}

	public async getContractorsBookedAndAvailableSlots({
		contractorIds,
		startDate,
		endDate,
		durationInMinutes,
		basicLocation,
		bookedSlots,
	}: {
		contractorIds: Array<string>,
		startDate: Date,
		endDate: Date,
		durationInMinutes: number,
		basicLocation: IBasicLocation,
		bookedSlots?: Array<BookedSlotsDto>,
	},): Promise<MapContractorBookedAndAvailableSlots> {
		const MILLISECONDS_IN_MINUTE = 60000
		const [availabilities, bookings,] = await Promise.all([
			this.availabilityService.getAvailabilitiesForContractors(contractorIds, {
				start_date: startDate,
				end_date:   endDate,
			},),
			this.bookingRepository.findBookings({
				where: {
					contractorId: {
						in: contractorIds,
					},
					date_time: {
						gte: startDate,
						lte: endDate,
					},
				},
				select: {
					id:                true,
					contractorId:      true,
					date_time:         true,
					location:          true,
					duration:          true,
					durationInMinutes: true,
				},
				orderBy: {
					date_time: 'asc',
				},
			},),
		],)

		const groupedBookings = new Map<string, Array<{
			id: string,
			date_time: Date,
			durationInMinutes: number | null,
			location: {
				latitude: number,
				longitude: number,
			} | null,
		}>>()

		bookedSlots?.forEach((bookedSlot,) => {
			const {contractorId,} = bookedSlot
			const existingBookedSlots = groupedBookings.get(contractorId,)
			const startTime = new Date(bookedSlot.startTime,)
			const endTime = new Date(bookedSlot.endTime,)
			const durationInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / MILLISECONDS_IN_MINUTE,)
			if (existingBookedSlots) {
				groupedBookings.set(contractorId, [...existingBookedSlots, {
					id:                '',
					date_time:         startTime,
					durationInMinutes,
					location:          basicLocation,
				},],)
			} else {
				groupedBookings.set(contractorId, [
					{
						id:                '',
						date_time:         startTime,
						durationInMinutes,
						location:          basicLocation,
					},
				],)
			}
		},)

		bookings.forEach((booking,) => {
			const contractorId = booking.contractorId ?? ''
			const existingBookings = groupedBookings.get(contractorId,)
			if (existingBookings) {
				groupedBookings.set(contractorId, [...existingBookings, {
					id:                booking.id,
					date_time:         booking.date_time,
					durationInMinutes: booking.duration,
					location:          booking.location ?
						{
							latitude:  booking.location.latitude,
							longitude: booking.location.longitude,
						} :
						null,
				},],)
			} else {
				groupedBookings.set(contractorId, [booking,],)
			}
		},)

		groupedBookings.forEach((bookings, contractorId,) => {
			groupedBookings.set(contractorId, bookings.sort((a, b,) => {
				return a.date_time.getTime() - b.date_time.getTime()
			},),)
		},)

		const groupedAvailabilities = new Map<string, Array<EditAvailabilityResDto>>()
		console.log('availabilities', availabilities.availabilities, offsetDiffHours,)
		console.log('availabilities.availabilities', availabilities.availabilities.flatMap((item,) => {
			return item.from
		},),)
		availabilities.availabilities.forEach((availability,) => {
			console.log('availability', availability,)
			const contractorId = availability.contractor_id
			const existingAvailabilities = groupedAvailabilities.get(contractorId,)
			const newAvailability: EditAvailabilityResDto = {
				...availability,
				availability: availability.availability.map((item,) => {
					return [item[0] - offsetDiffHours, item[1] - offsetDiffHours,]
				},),
				from:         availability.from.map((item,) => {
					return item - offsetDiffHours
				},),
				to:           availability.to.map((item,) => {
					return item - offsetDiffHours
				},),
			}
			if (existingAvailabilities) {
				groupedAvailabilities.set(contractorId, [...existingAvailabilities, newAvailability,],)
			} else {
				groupedAvailabilities.set(contractorId, [newAvailability,],)
			}
		},)

		const result = new Map<string, ContractorBookedAndAvailableSlots>()

		groupedAvailabilities.forEach((availabilities, contractorId,) => {
			const bookingsForContractor = groupedBookings.get(contractorId,)
			if (availabilities.length > 0) {
				result.set(contractorId, getContractorBookedAndAvailableSlots({
					bookings: bookingsForContractor?.map((booking,) => {
						return {
							id:                booking.id,
							date_time:         booking.date_time.toISOString(),
							durationInMinutes: booking.durationInMinutes ?? null,
							location:          booking.location,
						}
					},) ?? [],
					availabilities,
					durationInMinutes,
				},),)
			}
		},)
		const toRemove: Array<string> = []

		result.forEach((contractorBookedAndAvailableSlots, contractorId,) => {
			const hasAvailableSlots = contractorBookedAndAvailableSlots.days.some((day,) => {
				return day.slots.some((slot,) => {
					return slot.isAvailable
				},)
			},
			)
			if (!hasAvailableSlots) {
				toRemove.push(contractorId,)
			}
		},)

		toRemove.forEach((contractorId,) => {
			return result.delete(contractorId,)
		},)

		return removeUnnecessarySlots(result,)
	}

	public async getBasicLocationFromAddress({
		address,
	}: {
		address: string,
	},): Promise<IBasicLocation> {
		const coordinates = await this.mapService.getCoordFromAddress(address,)
		if (!coordinates) {
			throw new Error('Address not found',)
		}
		return {
			latitude:  coordinates.lat,
			longitude: coordinates.lng,
		}
	}

	public async findOnlyAvailableSlotsWithWayAndTime({
		contractorsSlots,
		basicLocation,
	}: {
		contractorsSlots: MapContractorBookedAndAvailableSlots,
		basicLocation: IBasicLocation,
	},): Promise<MapContractorBookedAndAvailableSlotsDayWithWayAndTime> {
		const contractorIds = Array.from(contractorsSlots.keys(),)

		const contractorsLocations = await this.basicContractorService.getContractorLocations(contractorIds,)
		const contractorTransportation = await this.basicContractorService.getContractorTransportation(contractorIds,)

		const contractorsLocationsMap = new Map<string, {
			latitude: number,
			longitude: number,
		}>()

		contractorsLocations.forEach((contractorLocation,) => {
			contractorsLocationsMap.set(contractorLocation.contractorId, {
				latitude:  contractorLocation.location?.latitude ?? 0,
				longitude: contractorLocation.location?.longitude ?? 0,
			},)
		},)

		const resultToRequest = new Map<string, Array<ContractorBookedAndAvailableSlotsDayWithWay>>()

		contractorsSlots.forEach((contractorBookedAndAvailableSlots, contractorId,) => {
			const contractorLocation = contractorsLocationsMap.get(contractorId,)
			if (contractorLocation) {
				const contractorBookedAndAvailableSlotsDayWithWay = this.processContractorTimeToLocation({
					contractorBookedAndAvailableSlots,
					contractorLocation,
				},)

				const filteredDaysAndSlots = this.excludeBookedOrNotAvailableDays({
					contractorBookedAndAvailableSlots: contractorBookedAndAvailableSlotsDayWithWay,
				},)

				resultToRequest.set(contractorId, filteredDaysAndSlots,)
			}
		},)

		const result: MapContractorBookedAndAvailableSlotsDayWithWayAndTime = new Map()

		await Promise.all(Array.from(resultToRequest.entries(),).map(async([contractorId, contractorBookedAndAvailableSlotsDayWithWay,],) => {
			const transportation = contractorTransportation.get(contractorId,)
			const resultDays = await Promise.all(contractorBookedAndAvailableSlotsDayWithWay.map(async(day,) => {
				return {
					...day,
					slots: await Promise.all(day.slots.map(async(slot, index,) => {
						const transport = transportation ?? ContractorTransportation.PUBLIC_TRANSPORTATION

						let timeFromPreviousLocation: number | null = null
						let timeToNextLocation: number | null = null

						if (!((index === 0 && day.isThisDayStartFromAvailableSlotOrPrevSlotAreNotBooked) || slot.isBooked)) {
							console.log('slot.previousLocation', slot.previousLocation,)
							const route = await this.bookingRoutesService.getOrCreateRoute({
								fromLat:        slot.previousLocation.latitude,
								fromLng:        slot.previousLocation.longitude,
								toLat:          basicLocation.latitude,
								toLng:          basicLocation.longitude,
								transportation: transport,
							},)
							timeFromPreviousLocation = route.duration
						}

						if (slot.nextLocation) {
							console.log('slot.nextLocation', slot.nextLocation,)
							const route = await this.bookingRoutesService.getOrCreateRoute({
								fromLat:        basicLocation.latitude,
								fromLng:        basicLocation.longitude,
								toLat:          slot.nextLocation.latitude,
								toLng:          slot.nextLocation.longitude,
								transportation: transport,
							},)
							timeToNextLocation = route.duration
						}

						return {
							...slot,
							timeFromPreviousLocation: timeFromPreviousLocation ?? 0,
							timeToNextLocation,
						}
					},),),

				}
			},),)

			result.set(contractorId, resultDays,)
		},),)

		return result
	}

	private excludeBookedOrNotAvailableDays({
		contractorBookedAndAvailableSlots,
	}: {
		contractorBookedAndAvailableSlots: Array<ContractorBookedAndAvailableSlotsDayWithWay>,
	},): Array<ContractorBookedAndAvailableSlotsDayWithWay> {
		const filteredDays = contractorBookedAndAvailableSlots.filter((day,) => {
			return day.slots.some((slot,) => {
				return slot.isAvailable && !slot.isBooked
			},)
		},)

		return filteredDays.map((day,) => {
			return this.excludeBookedOrNotAvailableSlots({
				contractorBookedAndAvailableSlotsDay: day,
			},)
		},)
	}

	private excludeBookedOrNotAvailableSlots({
		contractorBookedAndAvailableSlotsDay,
	}: {
		contractorBookedAndAvailableSlotsDay: ContractorBookedAndAvailableSlotsDayWithWay,
	},): ContractorBookedAndAvailableSlotsDayWithWay {
		return {
			...contractorBookedAndAvailableSlotsDay,
			slots: contractorBookedAndAvailableSlotsDay.slots.filter((slot,) => {
				return slot.isAvailable && !slot.isBooked
			},),
		}
	}

	private processContractorTimeToLocation({
		contractorBookedAndAvailableSlots,
		contractorLocation,
	}: {
		contractorBookedAndAvailableSlots: ContractorBookedAndAvailableSlots,
		contractorLocation: IBasicLocation,
	},): Array<ContractorBookedAndAvailableSlotsDayWithWay> {
		const result = new Map<string, ContractorBookedAndAvailableSlotsDayWithWay>()

		contractorBookedAndAvailableSlots.days.forEach((day,) => {
			result.set(getFormattedDate(day.dateTime,), this.processContractorTimeToLocationDay({
				contractorBookedAndAvailableSlotsDay: day,
				contractorLocation,
			},),)
		},)

		return Array.from(result.values(),)
	}

	private processContractorTimeToLocationDay({
		contractorBookedAndAvailableSlotsDay,
		contractorLocation,
	}: {
		contractorBookedAndAvailableSlotsDay: ContractorBookedAndAvailableSlotsDay,
		contractorLocation: IBasicLocation,
	},): ContractorBookedAndAvailableSlotsDayWithWay {
		const slotsWithWay: Array<IContractorBookedAndAvailableSlotsSlotWithWay> = contractorBookedAndAvailableSlotsDay.slots.map((slot, index, array,) => {
			const {isAvailable,} = slot
			if (!isAvailable) {
				return {
					...slot,
					previousLocation: contractorLocation,
					nextLocation:     null,
				}
			}

			const previousSlot = array[index - 1]
			const nextSlot = array[index + 1]

			let previousLocation = contractorLocation
			let nextLocation: IBasicLocation | null = null

			if (previousSlot?.booking?.location) {
				previousLocation = previousSlot.booking.location
			}

			if (nextSlot?.booking?.location) {
				nextLocation = nextSlot.booking.location
			}

			return {
				...slot,
				previousLocation,
				nextLocation,
			}
		},)

		return {
			contractorId:                                          contractorBookedAndAvailableSlotsDay.contractorId,
			dateTime:                                              contractorBookedAndAvailableSlotsDay.dateTime,
			formattedDate:                                         contractorBookedAndAvailableSlotsDay.formattedDate,
			isThisDayStartFromAvailableSlotOrPrevSlotAreNotBooked: contractorBookedAndAvailableSlotsDay.isThisDayStartFromAvailableSlotOrPrevSlotAreNotBooked,
			slots:                                                 slotsWithWay,
		}
	}
}