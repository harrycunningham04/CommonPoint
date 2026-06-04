/* eslint-disable max-lines */
/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type {
	B2BClients,
	B2CClients,
	ClientDispute,
	BookingGroup,
	Booking,
	ContractorDispute,
	Contractor,
	Office,
	EditRequest,
	EditRequestSession,
} from '@prisma/client'
import { BookingType, } from '@prisma/client'
import { PropertyType, } from '@prisma/client'
import { ContractorDisputeCategory, } from '@prisma/client'
import { BookingStage, } from '@prisma/client'
import { ClientDisputeCategory, DisputeStatus, } from '@prisma/client'
import {
	IsString,
	IsOptional,
	IsNumber,
	IsUUID,
	IsEnum,
	IsDate,
	IsBoolean,
	IsArray,
} from 'class-validator'

export class EditRequestDto {
	constructor(data?: EditRequestDto,) {
		if (data) {
			this.id = data.id
			this.description = data.description
		}
	}

  @ApiProperty({
  	description: 'The id of the edit request',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  @IsUUID()
	public id!: string

  @ApiProperty({
  	description: 'The description of the edit request',
  	example:     'This is a edit request description',
  },)
  @IsString()
  @IsOptional()
  public description!: string
}
export class GetDisputeClientAdminDto {
	constructor(data?: GetDisputeClientAdminDto,) {
		if (data) {
			this.id = data.id
			this.description = data.description
			this.clientFullName = data.clientFullName
			this.clientPhoneNumber = data.clientPhoneNumber
			this.datTimeDispute = data.datTimeDispute
			this.status = data.status
			this.category = data.category
			this.archived = data.archived
			this.createdAt = data.createdAt
			this.contractorAvatar = data.contractorAvatar
			this.disputeOffice = data.disputeOffice
		}
	}

  @ApiProperty({
  	description: 'The id of the dispute',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  @IsUUID()
	public id!: string

  @ApiProperty({
  	description: 'The full name of the client',
  	example:     'John Doe',
  },)
  @IsString()
  @IsOptional()
  public clientFullName!: string

  @ApiProperty({
  	description: 'The description of the dispute',
  	example:     'This is a dispute description',
  },)
  @IsString()
  @IsOptional()
  public description!: string

  @ApiProperty({
  	description: 'The phone number of the client',
  	example:     '+380991234567',
  },)
  @IsString()
  @IsOptional()
  public clientPhoneNumber!: string

  @ApiProperty({
  	description: 'The avatar of the contractor',
  	example:     'https://example.com/avatar.png',
  },)
  @IsString()
  @IsOptional()
  public contractorAvatar!: string

  @ApiProperty({
  	description: 'The date and time of the dispute',
  	example:     '2021-01-01T00:00:00.000Z',
  },)
  @IsDate()
  @IsOptional()
  public datTimeDispute!: Date

  @ApiProperty({
  	description: 'The status of the dispute',
  	example:     'open',
  },)
  @IsString()
  @IsEnum(DisputeStatus,)
  @IsOptional()
  public status!: DisputeStatus

  @ApiProperty({
  	description: 'The created at date of the dispute',
  	example:     '2021-01-01T00:00:00.000Z',
  },)
  @IsDate()
  @IsOptional()
  public createdAt!: Date

  @ApiProperty({
  	description: 'The category of the dispute',
  	example:     'open',
  },)
  @IsEnum({ ...ClientDisputeCategory, ...ContractorDisputeCategory, },)
  @IsOptional()
  public category!: ClientDisputeCategory | ContractorDisputeCategory

  @ApiProperty({
  	description: 'The archived status of the dispute',
  	example:     'false',
  },)
  @IsBoolean()
  @IsOptional()
  public archived!: boolean

  @ApiProperty({
  	description: 'The office name of the dispute',
  	example:     'Office 1',
  },)
  @IsString()
  @IsOptional()
  public disputeOffice!: string

  public static cast(
  	dispute: ClientDispute & {
      b2CClient?: B2CClients | null;
      b2BClient?: B2BClients | null;
	  editRequests?: Array<EditRequest>;
	  editRequestSession?: Array<EditRequestSession>;
    },
  ): GetDisputeClientAdminDto {
  	const client = dispute.b2CClient ?? dispute.b2BClient

  	if (!client) {
  		throw new Error(`Dispute ${dispute.id} has no associated client.`,)
  	}

  	return new GetDisputeClientAdminDto({
  		id:                dispute.id,
  		clientFullName:    `${client.firstName} ${client.lastName}`,
  		clientPhoneNumber: client.phoneNumber,
  		datTimeDispute:    dispute.created_at,
  		status:            dispute.status,
  		category:          dispute.category,
  		description:       dispute.description,
  		archived:          dispute.archived,
  		createdAt:         dispute.created_at,
  		contractorAvatar:  '',
  		disputeOffice:     '',
  	},)
  }

  public static castContractor(
  	dispute: ContractorDispute & { contractor: Contractor },
  ): GetDisputeClientAdminDto {
  	return new GetDisputeClientAdminDto({
  		id:                dispute.id,
  		clientFullName:    `${dispute.contractor.name} ${dispute.contractor.surname}`,
  		clientPhoneNumber: dispute.contractor.phone ?? '',
  		datTimeDispute:    dispute.created_at,
  		status:            dispute.status,
  		category:          dispute.category,
  		description:       dispute.description,
  		archived:          dispute.archived,
  		createdAt:         dispute.created_at,
  		contractorAvatar:  dispute.contractor.avatar ?? '',
  		disputeOffice:     '',
  	},)
  }

  public static castClientPortal(
  	dispute: ClientDispute & {
      b2CClient?: B2CClients | null;
      b2BClient?: B2BClients | null;
      bookingGroup?: (BookingGroup & { office?: Office | null }) | null;
    },
  ): GetDisputeClientAdminDto {
  	const client = dispute.b2CClient ?? dispute.b2BClient

  	if (!client) {
  		throw new Error(`Dispute ${dispute.id} has no associated client.`,)
  	}

  	return new GetDisputeClientAdminDto({
  		id:                dispute.id,
  		clientFullName:    `${client.firstName} ${client.lastName}`,
  		clientPhoneNumber: client.phoneNumber,
  		datTimeDispute:    dispute.created_at,
  		status:            dispute.status,
  		category:          dispute.category,
  		description:       dispute.description,
  		archived:          dispute.archived,
  		createdAt:         dispute.created_at,
  		contractorAvatar:  '',
  		disputeOffice:     dispute.bookingGroup?.office?.name ?? '',
  	},)
  }
}

export class DisputeOrderDto {
	constructor(data?: DisputeOrderDto,) {
		if (data) {
			this.id = data.id
			this.address = data.address
			this.bookingStages = data.bookingStages
			this.bookingDateTime = data.bookingDateTime
			this.bookingType = data.bookingType
		}
	}

  @ApiProperty({
  	description: 'The id of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  @IsUUID()
	public id!: string

  @ApiProperty({
  	description: 'The address of the booking',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsString()
  @IsOptional()
  public address!: string

  @ApiProperty({
  	description: 'The booking stage',
  	example:     'open',
  },)
  @IsArray()
  @IsEnum(BookingStage,)
  @IsOptional()
  public bookingStages!: Array<BookingStage>

  @ApiProperty({
  	description: 'The booking date and time',
  	example:     '2021-01-01T00:00:00.000Z',
  },)
  @IsDate()
  @IsOptional()
  public bookingDateTime!: Date

  @ApiProperty({
  	description: 'The booking type of the booking',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsEnum(BookingType,)
  @IsOptional()
  public bookingType!: BookingType
}

class DisputeBookingDetailDto {
	constructor(data?: DisputeBookingDetailDto,) {
		if (data) {
			this.id = data.id
			this.address = data.address
			this.propertyType = data.propertyType
			this.numberOfBedrooms = data.numberOfBedrooms
			this.squareFootage = data.squareFootage
			this.officeName = data.officeName
		}
	}

  @ApiProperty({
  	description: 'The id of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  @IsUUID()
	public id!: string

  @ApiProperty({
  	description: 'The address of the booking',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsString()
  @IsOptional()
  public address!: string

  @ApiProperty({
  	description: 'The property type of the booking',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsEnum(PropertyType,)
  @IsOptional()
  public propertyType!: PropertyType

  @ApiProperty({
  	description: 'The number of bedrooms of the booking',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsNumber()
  @IsOptional()
  public numberOfBedrooms!: number

  @ApiProperty({
  	description: 'The square footage of the booking',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsNumber()
  @IsOptional()
  public squareFootage!: number

  @ApiProperty({
  	description: 'The office name of the booking',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsString()
  @IsOptional()
  public officeName!: string
}

export class GetDisputeClientDetailDto {
	constructor(data?: GetDisputeClientDetailDto,) {
		if (data) {
			this.id = data.id
			this.description = data.description
			this.clientFullName = data.clientFullName
			this.clientPhoneNumber = data.clientPhoneNumber
			this.dateTimeDispute = data.dateTimeDispute
			this.status = data.status
			this.disputeOrder = data.disputeOrder
			this.createdAt = data.createdAt
			this.bookingDetail = data.bookingDetail
			this.editRequest = data.editRequest
			this.editRequestSession = data.editRequestSession
		}
	}

  @ApiProperty({
  	description: 'The id of the dispute',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  @IsUUID()
	public id!: string

  @ApiProperty({
  	description: 'The description of the dispute',
  	example:     'This is a dispute description',
  },)
  @IsString()
  @IsOptional()
  public description!: string

  @ApiProperty({
  	description: 'The dispute order',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsArray()
  @IsOptional()
  public disputeOrder!: Array<DisputeOrderDto>

  @ApiProperty({
  	description: 'The client full name',
  	example:     'John Doe',
  },)
  @IsString()
  @IsOptional()
  public clientFullName!: string

  @ApiProperty({
  	description: 'The client phone number',
  	example:     '+380991234567',
  },)
  @IsString()
  @IsOptional()
  public clientPhoneNumber!: string

  @ApiProperty({
  	description: 'The date and time of the dispute',
  	example:     '2021-01-01T00:00:00.000Z',
  },)
  @IsDate()
  @IsOptional()
  public dateTimeDispute!: Date

  @ApiProperty({
  	description: 'The status of the dispute',
  	example:     'open',
  },)
  @IsString()
  @IsEnum(DisputeStatus,)
  @IsOptional()
  public status!: DisputeStatus

  @ApiProperty({
  	description: 'The created at date of the dispute',
  	example:     '2021-01-01T00:00:00.000Z',
  },)
  @IsDate()
  @IsOptional()
  public createdAt!: Date

  @ApiProperty({
  	description: 'The booking detail',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsOptional()
  public bookingDetail?: DisputeBookingDetailDto

  @ApiProperty({
  	description: 'The edit request',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsOptional()
  public editRequest?: Array<EditRequest>

  @ApiProperty({
  	description: 'The edit request session',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsOptional()
  public editRequestSession?: Array<EditRequestSession>

  public static cast(
  	dispute: ClientDispute & {
      b2CClient?: B2CClients | null;
      b2BClient?: B2BClients | null;
      editRequests?: Array<EditRequest>;
      editRequestSession?: Array<EditRequestSession>;
      bookingGroup?:
        | (BookingGroup & {
            bookings: Array<Booking>;
            office?: Office | null;
          })
        | null;
    },
  ): GetDisputeClientDetailDto {
  	const client = dispute.b2CClient ?? dispute.b2BClient

  	if (!client) {
  		throw new Error(`Dispute ${dispute.id} has no associated client.`,)
  	}

  	const disputeOrder = dispute.bookingGroup?.bookings.map((booking,) => {
  		return new DisputeOrderDto({
  			id:              booking.id,
  			address:         booking.address ?? '',
  			bookingStages:   booking.booking_stage,
  			bookingDateTime: booking.date_time,
  			bookingType:     booking.bookingType,
  		},)
  	},)
  	return new GetDisputeClientDetailDto({
  		id:                 dispute.id,
  		description:        dispute.description,
  		clientFullName:     `${client.firstName} ${client.lastName}`,
  		clientPhoneNumber:  client.phoneNumber,
  		dateTimeDispute:    dispute.created_at,
  		status:             dispute.status,
  		disputeOrder:       disputeOrder ?? [],
  		createdAt:          dispute.created_at,
  		editRequest:        dispute.editRequests,
  		editRequestSession: dispute.editRequestSession,
  		bookingDetail:      dispute.bookingGroup?.bookings[0] ?
  			new DisputeBookingDetailDto({
  				id:      dispute.bookingGroup.bookings[0]?.id,
  				address: dispute.bookingGroup.bookings[0]?.address ?? '',
  				propertyType:
              dispute.bookingGroup.bookings[0]?.property_type ??
              PropertyType.FLAT_APARTMENT,
  				numberOfBedrooms:
              Number(dispute.bookingGroup.bookings[0]?.number_of_bedrooms,) ?? 0,
  				squareFootage:
              Number(dispute.bookingGroup.bookings[0]?.square_footage,) ?? 0,
  				officeName: dispute.bookingGroup?.office?.name ?? '',
  			},) :
  			undefined,
  	},)
  }

  public static castContractor(
  	dispute: ContractorDispute & { Booking: Booking; contractor: Contractor },
  ): GetDisputeClientDetailDto {
  	return new GetDisputeClientDetailDto({
  		id:                dispute.id,
  		description:       dispute.description,
  		clientFullName:    `${dispute.contractor.name} ${dispute.contractor.surname}`,
  		clientPhoneNumber: dispute.contractor.phone ?? '',
  		dateTimeDispute:   dispute.created_at,
  		status:            dispute.status,
  		disputeOrder:      [
  			{
  				id:              dispute.Booking.id,
  				address:         dispute.Booking.address ?? '',
  				bookingStages:   dispute.Booking.booking_stage,
  				bookingDateTime: dispute.Booking.date_time,
  				bookingType:     dispute.Booking.bookingType,
  			},
  		],
  		createdAt: dispute.created_at,
  	},)
  }
}
