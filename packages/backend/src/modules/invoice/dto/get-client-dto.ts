/* eslint-disable no-mixed-spaces-and-tabs */
import { IsArray, IsBoolean, IsDate, IsEnum, IsOptional, IsUUID, } from 'class-validator'

import { IsNotEmpty, } from 'class-validator'

import { ApiProperty, } from '@nestjs/swagger'
import { IsString, } from 'class-validator'
import { InvoiceStatus, } from '@prisma/client'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export class BasicInvoiceClientDto {
	constructor(data?: BasicInvoiceClientDto,) {
		if (data) {
			this.id = data.id
			this.sum = data.sum
			this.status = data.status
			this.createdAt = data.createdAt
			this.isDisputeCreated = data.isDisputeCreated
			this.officeName = data.officeName
			this.bookingGroupId = data.bookingGroupId
		}
	}

    @ApiProperty({
    	description: 'The id of the invoice',
    	example:     '123e4567-e89b-12d3-a456-426614174000',
    },)
    @IsUUID()
    @IsString()
    @IsNotEmpty()
	public id!: string

    @ApiProperty({
    	description: 'The id of the booking realted',
    	example:     '123e4567-e89b-12d3-a456-426614174000',
    },)
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    public bookingGroupId!: string

    @ApiProperty({
    	description: 'The sum of the invoice',
    	example:     '100',
    },)
    @IsString()
    @IsNotEmpty()
    public sum!: string

    @ApiProperty({
    	description: 'The status of the invoice',
    	example:     'PAID',
    },)
    @IsEnum(InvoiceStatus,)
    @IsNotEmpty()
    public status!: InvoiceStatus

    @ApiProperty({
    	description: 'The created at of the invoice',
    	example:     '2021-01-01',
    },)
    @IsDate()
    @IsNotEmpty()
    public createdAt!: Date

    @ApiProperty({
    	description: 'The is dispute created of the invoice',
    	example:     false,
    },)
        @IsBoolean()
    @IsNotEmpty()
    public isDisputeCreated!: boolean

    @ApiProperty({
    	description: 'The office name of the invoice',
    	example:     'Office 1',
    },)
    @IsString()
    @IsNotEmpty()
    public officeName!: string
}

export class GetInvoiceClientQuery extends PageOptionsDto {
@ApiProperty({
	description: 'Office ids',
},)
@IsOptional()
@IsArray()
	public officeIds! : Array<string>
}