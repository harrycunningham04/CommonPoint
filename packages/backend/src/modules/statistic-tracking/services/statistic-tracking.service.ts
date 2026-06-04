import { Injectable, } from '@nestjs/common'
import { StatisticType, type Prisma, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import type { IStatistic, } from '../types'

@Injectable()
export class StatisticTrackingService {
	constructor(private readonly prisma: PrismaService,) {}

	public async createStatistic(data: Prisma.StatisticCreateInput,): Promise<IStatistic> {
		return this.prisma.statistic.create({
			data,
		},)
	}

	public async getFirstStatistic(data: Prisma.StatisticWhereInput,): Promise<IStatistic | null> {
		return this.prisma.statistic.findFirst({
			where: data,
		},)
	}

	public async getStatistics(data: Prisma.StatisticFindManyArgs,): Promise<Array<IStatistic>> {
		return this.prisma.statistic.findMany(data,)
	}

	public async createCompletedBookingWithOrWithoutFloorplanStatus(contractorId: string, bookingId: string, isFloorplanAdded: boolean,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type:    {
					in: [
						StatisticType.BOOKING_DONE_WITH_FLOORPLAN,
						StatisticType.BOOKING_DONE_WITHOUT_FLOORPLAN,
					],
				},
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    isFloorplanAdded ?
						StatisticType.BOOKING_DONE_WITH_FLOORPLAN :
						StatisticType.BOOKING_DONE_WITHOUT_FLOORPLAN,
					payload: {
						bookingId,
					},
				},
			},)
		}
	}

	public async createCompletedBookingDurationIfNotExists(contractorId: string, bookingId: string, duration: number,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type:    StatisticType.COMPLETED_BOOKING_DURATION,
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    StatisticType.COMPLETED_BOOKING_DURATION,
					payload: {
						bookingId,
						duration,
					},
				},
			},)
			return
		}

		const payload = statistic.payload as { duration?: number }

		if (Number(payload.duration ?? 0,) !== duration) {
			await this.prisma.statistic.update({
				where: { id: statistic.id, },
				data:  { payload: { duration, }, },
			},)
		}
	}

	public async createCompletedBookingPhotoCount(contractorId: string, bookingId: string, photoCount: number,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type:    StatisticType.COMPLETED_BOOKING_PHOTO_COUNT,
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    StatisticType.COMPLETED_BOOKING_PHOTO_COUNT,
					payload: {
						bookingId,
						photoCount,
					},
				},
			},)
		}
		if (statistic) {
			await this.prisma.statistic.update({
				where: { id: statistic.id, },
				data:  { payload: { photoCount, }, },
			},)
		}
	}

	public async createRunningOnTimeIfNotExists(contractorId: string, bookingId: string,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type: {
					in: [
						StatisticType.BOOKING_RUNNING_ON_TIME,
						StatisticType.BOOKING_RUNNING_LATE,
					],
				},
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
			select: {
				id: true,
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    StatisticType.BOOKING_RUNNING_ON_TIME,
					payload: {
						path:   ['bookingId',],
						equals: bookingId,
					},
				},
				select: {
					id: true,
				},
			},)
		}
	}

	public async createRunningLateIfNotExists(contractorId: string, bookingId: string,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type: {
					in: [
						StatisticType.BOOKING_RUNNING_ON_TIME,
						StatisticType.BOOKING_RUNNING_LATE,
					],
				},
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
			select: {
				id: true,
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    StatisticType.BOOKING_RUNNING_LATE,
					payload: {
						path:   ['bookingId',],
						equals: bookingId,
					},
				},
				select: {
					id: true,
				},
			},)
		}
	}

	public async removeRunningLateIfExists(contractorId: string, bookingId: string,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type: {
					in: [
						StatisticType.BOOKING_RUNNING_LATE,
					],
				},
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
			select: {
				id: true,
			},
		},)

		if (!statistic) {
			return
		}

		await this.prisma.statistic.delete({
			where: { id: statistic.id, },
		},)
	}

	public async createBookingDoneIfNotExists(contractorId: string, bookingId: string,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type:    StatisticType.BOOKING_DONE,
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    StatisticType.BOOKING_DONE,
					payload: {
						bookingId,
					},
				},
			},)
		}
	}

	public async createBookingReviewRatingIfNotExists(contractorId: string, bookingId: string, rating: number,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type:    StatisticType.BOOKING_REVIEW_RATING,
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    StatisticType.BOOKING_REVIEW_RATING,
					payload: {
						bookingId,
						rating,
					},
				},
			},)
		}
	}

	public async createBookingFloorplanAccuracyIfNotExists(contractorId: string, bookingId: string, accuracyPoints: number,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type:    StatisticType.BOOKING_FOORPLAN_ACCURACY,
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    StatisticType.BOOKING_FOORPLAN_ACCURACY,
					payload: {
						bookingId,
						accuracyPoints,
					},
				},
			},)
		}
	}

	public async updateBookingFloorplanAccuracy(contractorId: string, bookingId: string, accuracyPoints: number, failedAccuracyPoints: number,): Promise<void> {
		const statistic = await this.prisma.statistic.findFirst({
			where: {
				contractorId,
				type:    StatisticType.BOOKING_FOORPLAN_ACCURACY,
				payload: {
					path:   ['bookingId',],
					equals: bookingId,
				},
			},
		},)

		if (!statistic) {
			await this.prisma.statistic.create({
				data: {
					contractor: {
						connect: {
							id: contractorId,
						},
					},
					type:    StatisticType.BOOKING_FOORPLAN_ACCURACY,
					payload: {
						bookingId,
						accuracyPoints,
						failedAccuracyPoints,
					},
				},
			},)
			return
		}

		await this.prisma.statistic.update({
			where: { id: statistic.id, },
			data:  { payload: { accuracyPoints, failedAccuracyPoints, }, },
		},)
	}

	public async createMany(data: Array<Prisma.StatisticCreateManyInput>,): Promise<void> {
		await this.prisma.statistic.createMany({
			data,
			skipDuplicates: true,
		},)
	}
}
