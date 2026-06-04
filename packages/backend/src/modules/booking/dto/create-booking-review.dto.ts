import { ApiProperty, } from '@nestjs/swagger'
import { IsNumber, IsNumberString, IsOptional, IsString, } from 'class-validator'

export class CreateReviewDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public comment?:string

    @ApiProperty()
    @IsNumber()
    public rating!:number
}