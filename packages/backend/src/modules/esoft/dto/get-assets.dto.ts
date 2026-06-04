/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsString, } from 'class-validator'

import { IsOptional, } from 'class-validator'

export class GetAssetsDto {
    @ApiProperty({ required: false, },)
    @IsString()
    @IsOptional()
	public reference?: string

    @ApiProperty({ required: false, },)
    @IsString()
    @IsOptional()
    public orderLineId?: string

    public get orderLineIdAsNumber(): number | undefined {
    	if (!this.orderLineId) {
    		return undefined
    	}
    	const num = Number(this.orderLineId,)
    	return isNaN(num,) ?
    		undefined :
    		num
    }
}
