/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'

export class GetContractorDto {
    @ApiProperty({
    	description: 'The contractor ID',
    	example:     '123e4567-e89b-12d3-a456-426614174000',
    },)
    @IsNotEmpty()
    @IsString()
	public id!: string
}