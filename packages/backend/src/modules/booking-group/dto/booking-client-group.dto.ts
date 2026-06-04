/* eslint-disable complexity */
/* eslint-disable no-negated-condition */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NotFoundException, } from '@nestjs/common'
import { BookingStatus,} from '@prisma/client'
import type { Booking, BookingGroup, BookingStageHistory, Location, Office, } from '@prisma/client'
import type { IProductTypeBooking, } from 'src/modules/booking/booking.types'
import type { SkillDto,} from 'src/modules/booking/dto'
import { BookingUniqueSkills, } from 'src/modules/booking/dto'
import { getUniqueSkillsById } from '../util/get-unique-skills.util'

type BookingWithUnique = IBookingWithAllInfo & {uniqueSkills : Set<SkillDto>; statuses : Array<BookingStatus>}

export interface IBookingWithAllInfo extends Booking {
	BookingStageHistory: Array<BookingStageHistory>
	location?: Location | null
	BookingToProductType: Array<{ productType: IProductTypeBooking['productType'] }>
	office?: Office | null
}

export type BookingsList = Array<BookingGroup & {bookings:Array<IBookingWithAllInfo & {BookingToProductType?:Array<{productType:IProductTypeBooking['productType']}>}>}>

export class BookingClientGroupDto {
	constructor(
		public readonly bookings: Array<Booking>,
	) {}

	public static mergeBookingsFromGroups(
		bookingGroups: BookingsList,
	): Array<IBookingWithAllInfo & {uniqueSkills:Array<SkillDto>}> {
		const mergedBookingsMap = new Map<string, BookingWithUnique>()

		bookingGroups.forEach((group,) => {
			const status = BookingClientGroupDto.getBookingClientStatuses(group.bookings,)
			group.bookings.forEach((booking,) => {
				const uniqueSkills = booking.BookingToProductType ?
					BookingUniqueSkills.getUniqueSkills({ BookingToProductType: booking.BookingToProductType, },) :
					[]

				if (!mergedBookingsMap.has(booking.bookingGroupId,)) {
					mergedBookingsMap.set(booking.bookingGroupId, {
						...booking,
						id:           group.id,
						preferences:  [...(booking.preferences || []),],
						uniqueSkills: new Set(uniqueSkills.map((item,) => {
							return item
						},),),
						statuses:       [booking.booking_status as BookingStatus,],
						booking_status: status,
					},)
				} else {
					const existingBooking = mergedBookingsMap.get(booking.bookingGroupId,)!
					existingBooking.statuses = [...existingBooking.statuses, booking.booking_status as BookingStatus,]
					existingBooking.preferences = [
						...new Set([...existingBooking.preferences, ...(booking.preferences || []),],),
					]
					existingBooking.duration = (existingBooking.duration ?? 0) + (booking.duration ?? 0)
					existingBooking.durationInMinutes =
						(existingBooking.durationInMinutes ?? 0) + (booking.durationInMinutes ?? 0)

					uniqueSkills.forEach((skill,) => {
						return existingBooking.uniqueSkills.add(skill,)
					},)
				}
			},)
		},)

		return Array.from(mergedBookingsMap.values(),).map((booking,) => {
			return {
				...booking,
				uniqueSkills:         getUniqueSkillsById([...booking.uniqueSkills,],),
				booking_status:       booking.booking_status,
				BookingStageHistory:  booking.BookingStageHistory,
				BookingToProductType: booking.BookingToProductType,
				office:               booking.office,
			}
		},)
	}

	public static getUniqueSkillsFromGroup(
		bookingGroup: BookingGroup & {
	bookings: Array<Booking & {
			BookingToProductType?: Array<{ productType: IProductTypeBooking['productType'] }>
		}>
		},
	): Array<SkillDto> {
		const skillSet = new Set<SkillDto>()

		bookingGroup.bookings.forEach((booking,) => {
			const uniqueSkills = booking.BookingToProductType ?
				BookingUniqueSkills.getUniqueSkills({ BookingToProductType: booking.BookingToProductType, },) :
				[]

			uniqueSkills.forEach((skill,) => {
				return skillSet.add(skill,)
			},)
		},)

		return getUniqueSkillsById([...skillSet,],)
	}

	public static getBookingInfo(bookings:Array<IBookingWithAllInfo>,):IBookingWithAllInfo & {uniqueSkills:Array<SkillDto>} {
		if (bookings.length === 0) {
			throw new NotFoundException('No bookings provided',)
		}

		const status = BookingClientGroupDto.getBookingClientStatuses(bookings,)

		const [firstBooking,] = bookings

		if (!firstBooking) {
			throw new NotFoundException('No bookings provided',)
		}

		const mergedBooking : IBookingWithAllInfo & {uniqueSkills:Set<SkillDto>} = {
			...firstBooking,
			id:                  firstBooking.bookingGroupId,
			preferences:         [],
			BookingStageHistory: [],
			uniqueSkills:        new Set(),
			duration:            0,
			durationInMinutes:   0,
			booking_status:      status,
		}

		bookings.forEach((booking,) => {
			const uniqueSkills = BookingUniqueSkills.getUniqueSkills({
				BookingToProductType: booking.BookingToProductType,
			},)
			uniqueSkills.forEach((skill,) => {
				return mergedBooking.uniqueSkills.add(skill,)
			},)
			booking.BookingStageHistory.forEach((stageHistory,) => {
				mergedBooking.BookingStageHistory.push(stageHistory,)
			},)

			mergedBooking.preferences = [...new Set([...mergedBooking.preferences, ...booking.preferences,],),]
		},)

		return {
			...mergedBooking,
			uniqueSkills: getUniqueSkillsById([...mergedBooking.uniqueSkills,],),
		}
	}

	public static getBookingClientStatuses(bookings:Array<Booking>,):BookingStatus {
		const statuses = new Set<BookingStatus>()

		bookings.forEach((booking,) => {
			statuses.add(booking.booking_status as BookingStatus,)
		},)

		const statusArray = Array.from(statuses,)

		if (statusArray.every((status,) => {
			return status === BookingStatus.DONE
		},)) {
			return BookingStatus.DONE
		}

		if (statusArray.every((status,) => {
			return status === BookingStatus.BOOKED
		},)) {
			return BookingStatus.BOOKED
		}

		const inProgressStatuses = new Set<BookingStatus>([
			BookingStatus.KEYS_COLLECTING,
			BookingStatus.LEFT_THE_SITE,
			BookingStatus.IN_REVIEW,
			BookingStatus.IN_PROGRESS,
		],)

		if (statusArray.some((status,) => {
			return inProgressStatuses.has(status,)
		},)) {
			return BookingStatus.IN_PROGRESS
		}

		return BookingStatus.BOOKED
	}
}

