/* eslint-disable @typescript-eslint/explicit-function-return-type */
import moment from 'moment'
import { BadRequestException, } from '@nestjs/common'

interface IBookingTimeCheck {
  dateTime: Date;
  duration: number;
}

export function checkTravelTimeOverlaps(params: {
  previousBooking?: IBookingTimeCheck;
  nextBooking?: IBookingTimeCheck;
  updatedBooking: IBookingTimeCheck;
  estimatedTimeFromPrevious?: number | null;
  estimatedTimeToNext?: number | null;
},) {
	const { previousBooking, nextBooking, updatedBooking, estimatedTimeFromPrevious, estimatedTimeToNext, } = params

	const getStartEnd = (startDate: Date, duration: number,) => {
		const start = moment(startDate,)
		const end = moment(start,).add(duration, 'minutes',)
		return { start, end, }
	}
	const updated = getStartEnd(updatedBooking.dateTime, updatedBooking.duration,)

	if (previousBooking && estimatedTimeFromPrevious !== null) {
		const prev = getStartEnd(previousBooking.dateTime, previousBooking.duration,)
		const prevEndWithTravel = moment(prev.end,).add(estimatedTimeFromPrevious, 'minutes',)

		if (prevEndWithTravel.isAfter(updated.start,)) {
			throw new BadRequestException('Travel time after the previous booking overlaps with the new booking',)
		}
	}

	if (nextBooking && estimatedTimeToNext !== null) {
		const next = getStartEnd(nextBooking.dateTime, nextBooking.duration,)
		const updatedEndWithTravel = moment(updated.end,).add(estimatedTimeToNext, 'minutes',)

		if (updatedEndWithTravel.isAfter(next.start,)) {
			throw new BadRequestException('Travel time to the next booking overlaps with the next booking',)
		}
	}
}