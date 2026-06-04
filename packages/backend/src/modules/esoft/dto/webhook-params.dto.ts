import { ApiProperty, } from '@nestjs/swagger'
import { IsEnum, IsOptional, } from 'class-validator'
import { ESoftNotificationTypes, } from '../esoft.types'

export class ESoftWebhookParamsDto {
    @ApiProperty()
    @IsOptional()
	public clientId!: string

    @ApiProperty()
    @IsOptional()
    public orderLineId!: string

    @ApiProperty({ enum: ESoftNotificationTypes, },)
    @IsEnum(ESoftNotificationTypes,)
    public type!: ESoftNotificationTypes

    @ApiProperty()
    @IsOptional()
    public reference!: string
}
