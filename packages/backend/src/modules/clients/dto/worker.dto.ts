import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, IsEmail, IsArray, IsUUID, IsNumber, IsEnum, } from 'class-validator'
import { Prisma, } from '@prisma/client'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export enum EWorkerSortBy {
	FIRST_NAME = 'firstName',
	LAST_NAME = 'lastName',
	EMAIL = 'email',
	ROLE = 'role',
	CREATED_AT = 'createdAt',
}

export enum ESortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export class GetWorkersQueryDto extends PageOptionsDto {
	@ApiProperty({
		description: 'Search query for worker name, email, or role',
		example:     'john',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public search?: string

	@ApiProperty({
		description: 'Filter by role',
		example:     'Manager',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public role?: string

	@ApiProperty({
		description: 'Filter by office ID',
		example:     'uuid-office-id',
		required:    false,
	},)
	@IsOptional()
	@IsUUID('4',)
	public officeId?: string

	@ApiProperty({
		description: 'Sort by field',
		enum:        EWorkerSortBy,
		example:     EWorkerSortBy.FIRST_NAME,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(EWorkerSortBy,)
	public sortBy?: EWorkerSortBy

	@ApiProperty({
		description: 'Sort order',
		enum:        ESortOrder,
		example:     ESortOrder.ASC,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(ESortOrder,)
	public sortOrder?: ESortOrder
}

export class CreateWorkerDto {
	@ApiProperty({
		description: 'First name of the worker',
		example:     'John',
	},)
	@IsString()
	public firstName!: string

	@ApiProperty({
		description: 'Last name of the worker',
		example:     'Doe',
	},)
	@IsString()
	public lastName!: string

	@ApiProperty({
		description: 'Email of the worker',
		example:     'john.doe@example.com',
	},)
	@IsEmail()
	public email!: string

	@ApiProperty({
		description: 'Phone number of the worker',
		example:     '+1234567890',
	},)
	@IsString()
	public phoneNumber!: string

	@ApiProperty({
		description: 'Role of the worker',
		example:     'Manager',
	},)
	@IsString()
	public role!: string

	@ApiProperty({
		description: 'Array of office IDs to assign the worker to',
		example:     ['uuid1', 'uuid2',],
	},)
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true, },)
	public officeIds?: Array<string>
}

export class UpdateWorkerDto {
	@ApiProperty({
		description: 'First name of the worker',
		example:     'John',
	},)
	@IsOptional()
	@IsString()
	public firstName?: string

	@ApiProperty({
		description: 'Last name of the worker',
		example:     'Doe',
	},)
	@IsOptional()
	@IsString()
	public lastName?: string

	@ApiProperty({
		description: 'Email of the worker',
		example:     'john.doe@example.com',
	},)
	@IsOptional()
	@IsEmail()
	public email?: string

	@ApiProperty({
		description: 'Phone number of the worker',
		example:     '+1234567890',
	},)
	@IsOptional()
	@IsString()
	public phoneNumber?: string

	@ApiProperty({
		description: 'Role of the worker',
		example:     'Manager',
	},)
	@IsOptional()
	@IsString()
	public role?: string

	@ApiProperty({
		description: 'Array of office IDs to assign the worker to',
		example:     ['uuid1', 'uuid2',],
	},)
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true, },)
	public officeIds?: Array<string>
}

export class GetBookingsForWorkerDto {
	@ApiProperty({
		description: 'Worker ID',
		example:     'uuid-worker-id',
	},)
	@IsString()
	@IsUUID('4',)
	public workerId!: string

	@ApiProperty({
		description: 'Booking where conditions',
		required:    false,
	},)
	@IsOptional()
	public bookingWhere?: Prisma.BookingWhereInput

	@ApiProperty({
		description: 'Number of records to take',
		example:     10,
		required:    false,
	},)
	@IsOptional()
	@IsNumber()
	public take?: number

	@ApiProperty({
		description: 'Number of records to skip',
		example:     0,
		required:    false,
	},)
	@IsOptional()
	@IsNumber()
	public skip?: number

	@ApiProperty({
		description: 'Booking include conditions',
		required:    false,
	},)
	@IsOptional()
	public bookingInclude?: Prisma.BookingInclude

	@ApiProperty({
		description: 'Booking group where conditions',
		required:    false,
	},)
	@IsOptional()
	public bookingGroupWhere?: Prisma.BookingGroupWhereInput
}