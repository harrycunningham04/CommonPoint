/* eslint-disable arrow-body-style */
import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, ValidateNested, } from 'class-validator'
import { UpdateRateDto, } from './update-rate.dto'
import { Type, } from 'class-transformer'

export class UpdateRatesDto {
    @ApiProperty({ type: UpdateRateDto, isArray: true, },)
    @IsArray()
    @ValidateNested({ each: true, },)
    @Type(() =>  UpdateRateDto,)
	public ratesUpdates!: Array<UpdateRateDto>
}
