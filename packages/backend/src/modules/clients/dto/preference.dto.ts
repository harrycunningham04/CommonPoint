/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { ContractorSkillNama } from '@prisma/client'
import { IsArray, IsEnum, IsOptional, IsString, } from 'class-validator'

export class CreatePreferenceDto {
    @ApiProperty({
    	description: 'The ids of the preferences to create',
    	type:        [String,],
    	example:     ['1', '2', '3',],
    },)
    @IsArray()
    @IsString({ each: true, },)
	public preferenceIds!: Array<string>
}

export class GetClientPreferencesAdminDto {
    @ApiProperty({
    	description: 'The id of the client',
    	type:        String,
    	example:     '1',
    },)
    @IsString()
	public clientId!: string
}

export class GetBookingFormPreferencesDto {
	@ApiProperty({
		description: 'The id of the office',
		type:        String,
		example:     '1',
	},)
	@IsString()
	@IsOptional()
	public officeId?: string

	@ApiProperty({
		description: 'The skills of the preferences',
		type:        [String,],
		example:     [ContractorSkillNama.VIDEO, ContractorSkillNama.PHOTO,],
	},)
	@IsArray()
	@IsEnum(ContractorSkillNama, { each: true, },)
	public skills!: Array<ContractorSkillNama>
}

export class GetBookingFormPreferencesSingleDto extends GetBookingFormPreferencesDto {
	@ApiProperty({
		description: 'The id of the client',
		type:        String,
		example:     '1',
	},)
	@IsString()
	public clientId!: string
}