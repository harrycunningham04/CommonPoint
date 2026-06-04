import { ApiProperty, } from '@nestjs/swagger'
import {  VoteType, } from '@prisma/client'
import { IsEnum, IsOptional, IsString, } from 'class-validator'
import { EMaterialType, } from '../booking.types'

export class VoteBookingDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public userId?:string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public materialId?:string

    @ApiProperty()
    @IsOptional()
    @IsEnum(VoteType,)
    public voteType? : VoteType

    @ApiProperty()
    @IsOptional()
    @IsEnum(EMaterialType,)
    public materialType? : EMaterialType
}