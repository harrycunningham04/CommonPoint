import { ApiProperty, } from '@nestjs/swagger'
import { NotificationCategory, NotificationType, NotificationUrgency, } from '@prisma/client'
import { IsEnum, IsOptional, IsString, } from 'class-validator'

export class CreateNotificationContractorDto {
    @IsString()
    @ApiProperty({type: String,},)
	public title!: string

    @IsString()
    @IsOptional()
    @ApiProperty({type: String,},)
    public message?: string

    @IsEnum(NotificationType,)
    @ApiProperty({enum: NotificationType,},)
    public type!: NotificationType

    @IsEnum(NotificationUrgency,)
    @ApiProperty({enum: NotificationUrgency,},)
    public urgency!: NotificationUrgency

    @IsEnum(NotificationCategory,)
    @IsOptional()
    @ApiProperty({enum: NotificationCategory,},)
    public category?: NotificationCategory

    @IsString()
    @ApiProperty({type: String,},)
    public contractorId!: string

    @IsString()
    @IsOptional()
    @ApiProperty({type: String,},)
    public readAdminId?: string

    @IsString()
    @IsOptional()
    @ApiProperty({type: String,},)
    public bookingId?: string
}