import { ApiProperty, } from '@nestjs/swagger'
import { EarningRateType, } from '@prisma/client'
import { IsEnum, IsNumber, IsOptional, IsUUID, } from 'class-validator'

export class UpdateRateDto {
    @ApiProperty()
    @IsUUID()
	public productTypeId!: string

    @ApiProperty()
    @IsNumber()
    public earningRate!: number

    @ApiProperty({ enum: EarningRateType, },)
    @IsEnum(EarningRateType,)
    public rateType!: EarningRateType

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    public additionalPrice?: number
}