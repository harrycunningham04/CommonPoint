import { IsEnum, IsNumber, } from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { ContractorTransportation } from '@prisma/client'

export class BookingRoutesFindDto {
    @ApiProperty({
    	description: 'From latitude',
    	example:     40.7128,
    },)
	@IsNumber()
    	public fromLat!: number

    @ApiProperty({
    	description: 'From longitude',
    	example:     40.7128,
    },)
	@IsNumber()
    public fromLng!: number

    @ApiProperty({
    	description: 'To latitude',
    	example:     40.7128,
    },)
	@IsNumber()
    public toLat!: number

    @ApiProperty({
    	description: 'To longitude',
    	example:     40.7128,
    },)
	@IsNumber()
    public toLng!: number

	@ApiProperty({
		description: 'Transport mode',
		example:     ContractorTransportation.CAR,
	},)
	@IsEnum(ContractorTransportation)
	public transportMode!: ContractorTransportation
}