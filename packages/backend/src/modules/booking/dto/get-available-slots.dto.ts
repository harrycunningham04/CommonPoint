/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { Type, } from 'class-transformer'
import { IsDate, } from 'class-validator'
import { EditAvailabilitiesDto, } from 'src/modules/contractor/dto/edit-availability.dto'

export class GetAvailabilityDto {
    @ApiProperty()
    @IsDate()
    @Type(() => {
    	return Date
    },)
	public startDate!: Date

    @ApiProperty()
    @IsDate()
    @Type(() => {
    	return Date
    },)
    public endDate!: Date
}

export class AdminEditAvailabilityDto extends EditAvailabilitiesDto {
    @ApiProperty()
    @IsDate()
    @Type(() => {
    	return Date
    },)
	public startDate!: Date

    @ApiProperty()
    @IsDate()
    @Type(() => {
    	return Date
    },)
    public endDate!: Date
}