/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsString, } from 'class-validator'

export class PackagesBrandDto {
	constructor(data?: PackagesBrandDto,) {
		if (data) {
			this.id = data.id
			this.fullName = data.fullName
		}
	}

    @ApiProperty({
    	description: 'Brand id',
    	type:        String,
    	example:     '1',
    },)
	@IsString()
	public id!: string

    @ApiProperty({
    	description: 'Brand full name',
    	type:        String,
    	example:     '1',
    },)
    @IsString()
    public fullName!: string
}