import { ApiProperty, ApiPropertyOptional, } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsDate, IsEnum, IsOptional, IsString, IsUUID, ValidateNested, } from 'class-validator'
import { Type, } from 'class-transformer'
import type { Vacation,} from '@prisma/client'
import { VacationType, } from '@prisma/client'

export class VacationSlotDto {
	@ApiPropertyOptional({
		description: 'Start date of the vacation slot',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	@IsDate()
	@Type(() => {
		return Date
	},)
	public startDate!: Date

	@ApiPropertyOptional({
		description: 'End date of the vacation slot',
		example:     '2024-01-07T23:59:59.000Z',
	},)
	@IsDate()
	@Type(() => {
		return Date
	},)
	public endDate!: Date
}

export class CreateVacationDto {
	@ApiProperty({
		description: 'Array of vacation slots',
		type:        [VacationSlotDto,],
	},)
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested({ each: true, },)
	@Type(() => {
		return VacationSlotDto
	},)
	public slots!: Array<VacationSlotDto>

	@ApiPropertyOptional({
		description: 'Type of vacation',
		enum:        VacationType,
		example:     VacationType.VACATION,
	},)
	@IsEnum(VacationType,)
	public vacationType!: VacationType

	@ApiPropertyOptional({
		description: 'Reason for the vacation',
		example:     'Annual family vacation',
	},)
	@IsOptional()
	@IsString()
	public reason?: string
}

export class UpdateVacationDto {
	@ApiPropertyOptional({
		description: 'Type of vacation',
		enum:        VacationType,
		example:     VacationType.VACATION,
	},)
	@IsOptional()
	@IsEnum(VacationType,)
	public vacationType?: VacationType

	@ApiPropertyOptional({
		description: 'Reason for the vacation',
		example:     'Annual family vacation',
	},)
	@IsOptional()
	@IsString()
	public reason?: string

	@ApiPropertyOptional({
		description: 'Start date of the vacation',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	@IsOptional()
	@IsDate()
	@Type(() => {
		return Date
	},)
	public startDate?: Date

	@ApiPropertyOptional({
		description: 'End date of the vacation',
		example:     '2024-01-07T23:59:59.000Z',
	},)
	@IsOptional()
	@IsDate()
	@Type(() => {
		return Date
	},)
	public endDate?: Date
}

export class GetVacationsQueryDto {
	@ApiPropertyOptional({
		description: 'Start date filter for vacations',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	@IsOptional()
	@IsDate()
	@Type(() => {
		return Date
	},)
	public startDate?: Date

	@ApiPropertyOptional({
		description: 'End date filter for vacations',
		example:     '2024-12-31T23:59:59.000Z',
	},)
	@IsOptional()
	@IsDate()
	@Type(() => {
		return Date
	},)
	public endDate?: Date
}

export class VacationResponseDto {
	constructor(data?: VacationResponseDto,) {
		if (data) {
			this.id = data.id
			this.contractorId = data.contractorId
			this.vacationType = data.vacationType
			this.reason = data.reason
			this.startDate = data.startDate
			this.endDate = data.endDate
			this.createdAt = data.createdAt
			this.updatedAt = data.updatedAt
		}
	}

	@ApiProperty({
		description: 'Vacation ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsUUID()
	public id!: string

	@ApiProperty({
		description: 'Contractor ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsUUID()
	public contractorId!: string

	@ApiProperty({
		description: 'Type of vacation',
		enum:        VacationType,
		example:     VacationType.VACATION,
	},)
	@IsEnum(VacationType,)
	public vacationType!: VacationType

	@ApiPropertyOptional({
		description: 'Reason for the vacation',
		example:     'Annual family vacation',
	},)
	@IsOptional()
	@IsString()
	public reason?: string

	@ApiProperty({
		description: 'Start date of the vacation',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public startDate!: Date

	@ApiProperty({
		description: 'End date of the vacation',
		example:     '2024-01-07T23:59:59.000Z',
	},)
	public endDate!: Date

	@ApiProperty({
		description: 'Creation date',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public createdAt!: Date

	@ApiProperty({
		description: 'Last update date',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public updatedAt!: Date

	public static cast(vacation: Vacation,): VacationResponseDto {
		return new VacationResponseDto({
			id:           vacation.id,
			contractorId: vacation.contractorId,
			vacationType: vacation.vacationType,
			reason:       vacation.reason ?? undefined,
			startDate:    vacation.startDate,
			endDate:      vacation.endDate,
			createdAt:    vacation.createdAt,
			updatedAt:    vacation.updatedAt,
		},)
	}
}
