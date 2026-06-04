import { ApiProperty, } from '@nestjs/swagger'
import { IsEnum, IsOptional, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { ENotificationType, } from '../types/create-user-notification.types'

export class NotificationPageOptionsDto extends PageOptionsDto {
    @ApiProperty({description: 'Type of notification', enum: ENotificationType, example: 'CLIENT',},)
    @IsEnum(ENotificationType,)
    @IsOptional()
	public type?: ENotificationType
}