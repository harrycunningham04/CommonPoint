/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type { ContractorInvoice, } from '@prisma/client'
import { InvoiceContractor, } from '@prisma/client'
import { Type, } from 'class-transformer'
import {
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
	IsUUID,
	ValidateNested,
} from 'class-validator'

export class ContractorInvoiceDto {
	constructor(data?: ContractorInvoiceDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.sum = data.sum
			this.address = data.address
			this.sum = data.sum
			this.date = data.date
			this.status = data.status
			this.contractor_id = data.contractor_id
			this.booking_id = data.booking_id
		}
	}

  @IsUUID()
  @IsString()
  @IsNotEmpty()
	public id!: string

  @IsString()
  public name!: string

  @IsString()
  @IsNotEmpty()
  public sum!: number

  @IsString()
  public address!: string

  @IsDate()
  @Type(() => {
  	return Date
  },)
  public date!: Date

  @IsEnum(InvoiceContractor,)
  @IsNotEmpty()
  public status!: InvoiceContractor

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  public contractor_id!: string

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  public booking_id!: string

  public static cast(
  	data: ContractorInvoice & {
      Booking: {
        id: string;
        address: string | null;
        date_time: Date;
      };
    },
  ): ContractorInvoiceDto {
  	const dto = new ContractorInvoiceDto()
  	const sumNumber = Number(data.sum,)
  	dto.id = data.id
  	dto.name = data.name
  	dto.sum = Number.isNaN(sumNumber,) ?
  		0 :
  		sumNumber
  	dto.address = data.Booking.address ?? ''
  	dto.date = data.Booking.date_time
  	dto.status = data.status
  	dto.contractor_id = data.contractor_id
  	dto.booking_id = data.Booking.id
  	return dto
  }
}

export class ContractorInvoicesDto {
	constructor(data?: ContractorInvoicesDto,) {
		if (data) {
			this.invoices = data.invoices
			return
		}
		this.invoices = []
	}

  @ValidateNested({ each: true, },)
  @Type(() => {
  	return ContractorInvoiceDto
  },)
	public invoices: Array<ContractorInvoiceDto>

  public static cast(
  	data: Array<
      ContractorInvoice & {
        Booking: {
          id: string;
          address: string | null;
          date_time: Date;
        };
      }
    >,
  ): ContractorInvoicesDto {
  	const dto = new ContractorInvoicesDto()
  	dto.invoices = data.map((it,) => {
  		return new ContractorInvoiceDto({
  			id:            it.id,
  			name:          it.name,
  			sum:           it.sum,
  			status:        it.status,
  			contractor_id: it.contractor_id,
  			booking_id:     it.Booking.id,
  			address:       it.Booking.address ?? '',
  			date:          it.Booking.date_time,
  		},)
  	},)
  	return dto
  }
}

export class ContractorInvoiceStatisticDto {
	constructor(data?: ContractorInvoiceStatisticDto,) {
		if (data) {
			this.totalInvoicesSum = data.totalInvoicesSum
			this.jobsInProgress = data.jobsInProgress
			this.totalJobs = data.totalJobs
			this.totalDuration = data.totalDuration
		}
	}

	@ApiProperty({
		description: 'Total sum of invoices',
		type:        Number,
	},)
	@IsNumber()
	public totalInvoicesSum!: number

	@ApiProperty({
		description: 'Total number of jobs in progress',
		type:        Number,
	},)
	@IsNumber()
	public jobsInProgress!: number

	@ApiProperty({
		description: 'Total number of jobs',
		type:        Number,
	},)
	@IsNumber()
	public totalJobs!: number

	@ApiProperty({
		description: 'Total duration of jobs',
		type:        Number,
	},)
	@IsNumber()
	public totalDuration!: number
}