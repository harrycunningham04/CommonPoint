/* eslint-disable complexity */
/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsDate, IsNotEmpty, ValidateNested, } from 'class-validator'
import { IsString, } from 'class-validator'
import { BookingDetailContractorDto, } from './booking-admin-detaIls.dto'
import { Type, } from 'class-transformer'
import type { Report, } from '@prisma/client'
import type { Contractor, } from '@prisma/client'
import type { ContractorDispute, } from '@prisma/client'

export class BookingReportDto {
	constructor(data?: BookingReportDto,) {
		if (data) {
			this.id = data.id
			this.contractorDetail = data.contractorDetail
			this.attachments = data.attachments
			this.location = data.location
			this.problem = data.problem
			this.solution = data.solution
			this.dateTime = data.dateTime
		}
	}

    @ApiProperty({
    	type:        String,
    	description: 'The id of the booking report',
    },)
    @IsString()
    @IsNotEmpty()
	public id!: string

    @ApiProperty({
    	type:        String,
    	description: 'The contractor detail',
    },)
    @ValidateNested()
    @Type(() => {
    	return BookingDetailContractorDto
    },)
    public contractorDetail!: BookingDetailContractorDto

    @ApiProperty({
    	type:        String,
    	description: 'The attachments',
    },)
	@IsArray()
	@ValidateNested({ each: true, },)
    public attachments!: Array<string>

    @ApiProperty({
    	type:        String,
    	description: 'The location',
    },)
    @IsString()
    @IsNotEmpty()
    public location!: string

    @ApiProperty({
    	type:        String,
    	description: 'The problem',
    },)
    @IsString()
    @IsNotEmpty()
    public problem!: string

    @ApiProperty({
    	type:        String,
    	description: 'The solution',
    },)
    @IsString()
    @IsNotEmpty()
    public solution!: string

    @ApiProperty({
    	type:        String,
    	description: 'The date and time',
    },)
    @IsDate()
    @IsNotEmpty()
    public dateTime!: Date

    public static cast(data: ContractorDispute & {
        report?: Report | null,
        contractor?: Contractor | null,
    },): BookingReportDto {
    	return new BookingReportDto({
    		id:               data.report?.id ?? '',
    		contractorDetail: new BookingDetailContractorDto({
    			id:       data.contractor?.id ?? '',
    			fullName: `${data.contractor?.name ?? ''} ${data.contractor?.surname ?? ''}`,
    			phone:    data.contractor?.phone ?? '',
    			avatar:   data.contractor?.avatar ?? '',
    			onSite:   data.contractor?.onSite ?? false,
    		},),
    		attachments: data.report?.attachments ?? [],
    		location:    data.report?.location ?? '',
    		problem:     data.report?.problem ?? '',
    		solution:    data.report?.solution ?? '',
    		dateTime:    data.report?.createdAt ?? new Date(),
    	},)
    }
}
