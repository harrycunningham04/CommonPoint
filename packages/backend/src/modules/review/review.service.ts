/* eslint-disable no-underscore-dangle */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { ReviewGroupedDto, ReviewAdminDto,} from './dto/review.dto'
import type { BasicReviewDto, ReviewOptionsDto, UpdateReviewDto, } from './dto/review.dto'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { BookingReview, Prisma, } from '@prisma/client'
import type { PagedResDto, PagedResWithCountDto,} from 'src/shared/dto/paged-res.dto'
import { StatisticTrackingService, } from '../statistic-tracking/services/statistic-tracking.service'
import { ReviewOrder, ReviewOrderBy, } from './review.types'
import { AdminReviewInclude, } from './review.const'

@Injectable()
export class ReviewService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly statisticTrackingService: StatisticTrackingService,
	) {}

	public async getReview(bookingId: string,): Promise<ReviewGroupedDto> {
		const review = await this.prisma.bookingReview.findFirst({
			where: {
				bookingId,
			},
			include: {
				booking: {
					select: {
						address: true,
					},
				},
			},
		},)

		if (!review) {
			throw new NotFoundException('Review not found',)
		}

		return ReviewGroupedDto.cast({
			rating:        review.rating,
			reviewDate:    review.reviewDate,
			reviewDetails: review,
			bookingId,
		},)
	}

	public async createReview(data: BasicReviewDto,): Promise<BookingReview> {
		const review = await this.prisma.bookingReview.create({
			data: {
				booking: {
					connect: {
						id: data.bookingId,
					},
				},
				rating:  data.rating,
				comment: data.comment,
			},
			include: {
				booking: {
					select: {
						contractorId: true,
						address:      true,
					},
				},
			},
		},)

		if (review.booking.contractorId) {
			await this.statisticTrackingService.createBookingReviewRatingIfNotExists(
				review.booking.contractorId,
				review.bookingId,
				review.rating,
			)
		}

		return review
	}

	public async updateReview(data: UpdateReviewDto,): Promise<ReviewGroupedDto> {
		const review = await this.prisma.bookingReview.update({
			where: {
				id: data.id,
			},
			data: {
				rating:  data.rating,
				comment: data.comment,
			},
			include: {
				booking: {
					select: {
						address: true,
					},
				},
			},
		},)

		return ReviewGroupedDto.cast({
			rating:        review.rating,
			reviewDate:    review.reviewDate,
			reviewDetails: review,
			bookingId:     data.bookingId,
		},)
	}

	public async reviews(contractorId: string, options: ReviewOptionsDto,): Promise<PagedResWithCountDto<ReviewGroupedDto>> {
		const where: Prisma.BookingReviewWhereInput =  {
			booking: {
				contractorId,
			},
		}
		const allData = await this.prisma.bookingReview.groupBy({
			where,
			by:     ['bookingId',],
			_count: {
				id: true,
			},
			_avg:   {
				rating: true,
			},
			_max:   {
				reviewDate: true,
			},
			orderBy: {
				...(options.orderBy === ReviewOrderBy.CREATED_AT ?
					{
						_max: {
							reviewDate: options.order === ReviewOrder.DESC ?
								'desc' :
								'asc',
						},
					} :
					{
						_avg: {
							rating: options.order === ReviewOrder.DESC ?
								'desc' :
								'asc',
						},
					}),
			},
			take: options.take + 1,
			skip: options.skip,
		},
		)

		const reviews = allData.slice(0, options.take,)

		const bookingIds = reviews.map((it,) => {
			return it.bookingId
		},)

		const singleReviews = await this.prisma.bookingReview.findMany({
			where: {
				bookingId: {
					in: bookingIds,
				},
			},
			include: {
				booking: {
					select: {
						address: true,
					},
				},
			},
		},)

		const count = await this.prisma.bookingReview.count({
			where,
		},)

		return {
    	data:  reviews.map((it,) => {
				const reviewDetails = singleReviews.find((searchedItem,) => {
					return searchedItem.bookingId === it.bookingId
				},)
    		return ReviewGroupedDto.cast({
					address:       reviewDetails?.booking.address ?? '',
					count:         it._count.id,
					rating:        it._avg.rating ?? 0,
					reviewDate:    it._max.reviewDate,
					reviewDetails: reviewDetails ?? null,
					bookingId:     it.bookingId,
				},)
    	},),
    	hasNext: allData.length > options.take,
			count,
		}
	}

	public async reviewByBookingId(bookingId: string, paginator: PageOptionsDto,): Promise<PagedResDto<ReviewGroupedDto>> {
		const reviews = await this.prisma.bookingReview.findMany({
			where: {
				bookingId,
			},
			include: {
				booking: {
					select: {
						address: true,
					},
				},
			},
			take: paginator.take + 1,
			skip: paginator.skip,
		},)

		return {
			data: reviews.map((it,) => {
				return ReviewGroupedDto.cast({
					reviewDate:    it.reviewDate,
					rating:        it.rating,
					reviewDetails: it,
					bookingId:     it.bookingId,
				},)
			},),
			hasNext: reviews.length > paginator.take,
		}
	}

	public async reviewsAdmin(where: Prisma.BookingReviewWhereInput, paginator: PageOptionsDto,): Promise<PagedResDto<ReviewAdminDto>> {
		const allReviews = await this.prisma.bookingReview.findMany({
			where,
			include: AdminReviewInclude,
			take:    paginator.take + 1,
			skip:    paginator.skip,
		},)

		const reviews = allReviews.slice(0, paginator.take,)

		return {
			data: reviews.map((it,) => {
				return ReviewAdminDto.cast(it,)
			},),
			hasNext: allReviews.length > paginator.take,
		}
	}

	public async getAverageRating(contractorId: string,): Promise<number> {
		const averageRating = await this.prisma.bookingReview.aggregate({
			where: {
				booking: {
					contractorId,
				},
			},
			_avg: {
				rating: true,
			},
		},)

		return averageRating._avg.rating ?? 0
	}
}
