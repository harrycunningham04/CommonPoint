import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'

export class AddReviewDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public contractorId!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public text!: string
}
