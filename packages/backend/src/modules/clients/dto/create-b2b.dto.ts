/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsString, IsEmail, IsOptional, IsPhoneNumber, IsArray, } from 'class-validator'
import type { OfficeCreateDto, } from './office-create-dto'

export class CreateB2BDto {
	@ApiProperty({
		description: 'First name of the client',
		example:     'John',
	},)
	@IsString()
	@IsOptional()
	public firstName?: string | null

	@ApiProperty({
		description: 'Last name of the client',
		example:     'Doe',
	},)
	@IsString()
	@IsOptional()
	public lastName?: string | null

	@ApiProperty({
		description: 'Company name of the client',
		example:     'Acme Inc.',
	},)
	@IsOptional()
	@IsString()
	public companyName?: string | null

	@ApiProperty({
		description: 'Email of the client',
		example:     'john.doe@example.com',
	},)
	@IsEmail()
	public email!: string

	@ApiProperty({
		description: 'Phone number of the client',
		example:     '+1234567890',
	},)
	// @IsPhoneNumber()
	@IsString()
	public phoneNumber!: string

	@ApiProperty({
		description: 'Address of the client',
		example:     '123 Main St, Anytown, USA',
	},)
	@IsString()
	public address!: string

	@ApiProperty({
		description: 'Billing address of the client',
		example:     '456 Billing St, Anytown, USA',
	},)
	@IsOptional()
	@IsString()
	public billingAddress?: string | null

    @ApiProperty({
    	description: 'Office ids of the client',
    	type:        [String,],
    },)
	@IsArray()
	@IsOptional()
	public offices?: Array<OfficeCreateDto>
}