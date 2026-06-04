/* eslint-disable complexity */
import { HttpException, } from '@nestjs/common'
import { HttpStatus, } from '@nestjs/common'
import { ApiProperty, } from '@nestjs/swagger'
import type { BookingReview, Contractor, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, ValidateNested, } from 'class-validator'
import { IsString, } from 'class-validator'
import { IsUUID, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { ReviewOrder, ReviewOrderBy, } from '../review.types'

export enum ReviewGroupedType {
	GROUPED = 'GROUPED',
	SINGLE = 'SINGLE',
}

export class ReviewOptionsDto extends PageOptionsDto {
	constructor(data?: ReviewOptionsDto,) {
		super(data,)
		if (data) {
			this.orderBy = data.orderBy
			this.order = data.order
		}
	}

	@ApiProperty({
		description: 'The order by of the review',
		example:     ReviewOrderBy.CREATED_AT,
		enum:        [ReviewOrderBy.CREATED_AT, ReviewOrderBy.RATING,],
	},)
	@IsEnum(ReviewOrderBy,)
	public orderBy: ReviewOrderBy = ReviewOrderBy.CREATED_AT

	@ApiProperty({
		description: 'The order of the review',
		example:     ReviewOrder.DESC,
		enum:        [ReviewOrder.ASC, ReviewOrder.DESC,],
	},)
	@IsEnum(ReviewOrder,)
	public order: ReviewOrder = ReviewOrder.DESC
}

export class BasicReviewDto {
	constructor(data?:BasicReviewDto,) {
		if (data) {
			this.rating = data.rating
			this.comment = data.comment
			this.bookingId = data.bookingId
			return
		}
		this.rating = 0
		this.comment = ''
		this.bookingId = ''
	}

	@ApiProperty({
		description: 'The rating of the review',
		example:     5,
	},)
	@IsNumber()
	@IsNotEmpty()
	public rating: number

	@ApiProperty({
		description: 'The comment of the review',
		example:     'This is a comment',
	},)
	@IsString()
	@IsNotEmpty()
	public comment: string

	@ApiProperty({
		description: 'The booking id of the review',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsUUID()
	@IsString()
	@IsNotEmpty()
	public bookingId: string
}

export class UpdateReviewDto extends BasicReviewDto {
	constructor(data?: UpdateReviewDto,) {
		super(data,)
		if (data) {
			this.id = data.id
			return
		}
		this.id = ''
	}

	@ApiProperty({
		description: 'The id of the review',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsUUID()
	@IsString()
	@IsNotEmpty()
	public id: string
}

export class ReviewDetailsDto extends BasicReviewDto {
	constructor(data?: ReviewDetailsDto,) {
		super(data,)
		if (data) {
			this.id = data.id
			return
		}
		this.id = ''
	}

	@ApiProperty({
		description: 'The id of the review',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsUUID()
	@IsString()
	public id: string
}

export class ReviewGroupedDto {
	constructor(data?: ReviewGroupedDto,) {
		if (data) {
			this.type = data.type
			this.count = data.count
			this.rating = data.rating
			this.reviewDate = data.reviewDate
			this.address = data.address
			this.reviewDetails = data.reviewDetails
			this.bookingId = data.bookingId
			return
		}
		this.type = ReviewGroupedType.SINGLE
		this.count = 0
		this.rating = 0
		this.reviewDate = new Date()
		this.address = ''
		this.reviewDetails = null
		this.bookingId = ''
	}

	@ApiProperty({
		description: 'The type of the review',
		example:     ReviewGroupedType.SINGLE,
	},)
	@IsEnum(ReviewGroupedType,)
	public type: ReviewGroupedType

	@ApiProperty({
		description: 'The count of the review',
		example:     0,
	},)
	@IsNumber()
	public count: number

	@ApiProperty({
		description: 'The rating of the review',
		example:     0,
	},)
	@IsNumber()
	public rating: number

	@ApiProperty({
		description: 'The review date of the review',
		example:     new Date(),
	},)
	@IsDate()
	@Type(() => {
		return Date
	},)
	public reviewDate: Date

	@ApiProperty({
		description: 'The review details of the review',
	},)
	@IsOptional()
	@ValidateNested()
	@Type(() => {
		return ReviewDetailsDto
	},)
	public reviewDetails: ReviewDetailsDto | null

	@ApiProperty({
		description: 'The address of the review',
		example:     '123 Main St, Anytown, USA',
	},)
	@IsString()
	@IsNotEmpty()
	public address: string

	@ApiProperty({
		description: 'Booking id of nested reviews',
	},)
	@IsString()
	@IsNotEmpty()
	public bookingId: string

	public static cast(data: {
		address?: string,
		count?: number,
		rating: number,
		bookingId:string,
		reviewDate: Date | null,
		reviewDetails: BookingReview & { booking: { address: string | null } } | null,
	},): ReviewGroupedDto {
		const { rating, reviewDetails,bookingId, } = data
		const reviewDate = data.reviewDate ?? new Date()
		const count = data.count ?? 1
		const address = data.address ?? reviewDetails?.booking.address ?? ''

		if (count === 1 && reviewDetails) {
			return new ReviewGroupedDto({
				type:          ReviewGroupedType.SINGLE,
				count,
				rating,
				reviewDate,
				address,
				bookingId,
				reviewDetails: {
					id:         reviewDetails.id,
					rating:     reviewDetails.rating,
					comment:    reviewDetails.comment ?? '',
					bookingId:  reviewDetails.bookingId,
				},
			},)
		}
		return new ReviewGroupedDto({
			type:          ReviewGroupedType.GROUPED,
			count,
			rating,
			reviewDate,
			address,
			reviewDetails: null,
			bookingId,
		},)
	}
}

export class BasicBookingDto {
	constructor(data?: BasicBookingDto,) {
		if (data) {
			this.firstName = data.firstName
			this.lastName = data.lastName
			this.phoneNumber = data.phoneNumber
			this.dateTime = data.dateTime
			this.address = data.address
			return
		}
		this.firstName = ''
		this.lastName = ''
		this.phoneNumber = ''
		this.dateTime = new Date()
		this.address = ''
	}

	@ApiProperty({
		description: 'The first name of the booking',
		example:     'John',
	},)
	@IsString()
	@IsNotEmpty()
	public firstName: string

	@ApiProperty({
		description: 'The last name of the booking',
		example:     'Doe',
	},)
	@IsString()
	@IsNotEmpty()
	public lastName: string

	@ApiProperty({
		description: 'The phone number of the booking',
		example:     '1234567890',
	},)
	@IsString()
	@IsNotEmpty()
	public phoneNumber: string

	@ApiProperty({
		description: 'The date and time of the booking',
		example:     new Date(),
	},)
	@IsDate()
	@Type(() => {
		return Date
	},)
	public dateTime: Date

	@ApiProperty({
		description: 'The address of the booking',
		example:     '123 Main St, Anytown, USA',
	},)
	@IsString()
	public address: string
}

export class ContractorDetailsDto {
	constructor(data?: ContractorDetailsDto,) {
		if (data) {
			this.name = data.name
			this.surname = data.surname
			this.phone = data.phone
		}
		this.name = ''
		this.surname = ''
		this.phone = ''
	}

	@ApiProperty({
		description: 'The name of the contractor',
		example:     'John',
	},)
	@IsString()
	@IsNotEmpty()
	public name: string

	@ApiProperty({
		description: 'The surname of the contractor',
		example:     'Doe',
	},)
	@IsString()
	@IsNotEmpty()
	public surname: string

	@ApiProperty({
		description: 'The phone of the contractor',
		example:     '1234567890',
	},)
	@IsString()
	@IsOptional()
	public phone: string | null
}

export class ReviewAdminDto extends UpdateReviewDto {
	constructor(data?: ReviewAdminDto,) {
		super(data,)
		if (data) {
			this.reviewDate = data.reviewDate
			this.bookingDetails = data.bookingDetails
			this.contractorDetails = data.contractorDetails
			return
		}
		this.reviewDate = new Date()
		this.bookingDetails = new BasicBookingDto()
		this.contractorDetails = new ContractorDetailsDto()
	}

	@ApiProperty({
		description: 'The date and time of the review',
		example:     new Date(),
	},)
	@IsDate()
	@Type(() => {
		return Date
	},)
	public reviewDate: Date

	@ApiProperty({
		description: 'The booking details of the review',
	},)
	@ValidateNested()
	@Type(() => {
		return BasicBookingDto
	},)
	public bookingDetails: BasicBookingDto

	@ApiProperty({
		description: 'The contractor details of the review',
	},)
	@ValidateNested()
	@Type(() => {
		return ContractorDetailsDto
	},)
	public contractorDetails: ContractorDetailsDto

	public static cast(data: BookingReview & {
    booking: {
        address: string | null;
        date_time: Date;
		contractor :  {
			name : string;
			surname : string;
			phone ?: string | null;
		} | null;
        b2CClients: {
            firstName: string;
            lastName: string;
            phoneNumber: string;
        } | null;
				b2BClients: {
					firstName?: string | null;
					lastName?: string | null;
					phoneNumber: string;
			} | null;
    };
},): ReviewAdminDto {
	  const client = data.booking.b2CClients ?? data.booking.b2BClients

		if (!client) {
			throw new HttpException('Client not found', HttpStatus.NOT_FOUND,)
		}

		return new ReviewAdminDto({
			id:             data.id,
			rating:         data.rating,
			comment:        data.comment ?? '',
			bookingId:      data.bookingId,
			reviewDate:     data.reviewDate,
			bookingDetails: {
				firstName:    client.firstName ?? '',
				lastName:    client.lastName ?? '',
				phoneNumber: client.phoneNumber,
				dateTime:    data.booking.date_time,
				address:     data.booking.address ?? '',
			},
			contractorDetails: {
				name:    data.booking.contractor?.name ?? '',
				surname: data.booking.contractor?.surname ?? '',
				phone:   data.booking.contractor?.phone ?? null,
			},
		},)
	}
}
