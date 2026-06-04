/* eslint-disable indent */
import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'

export class CreateReviewTrainingDto {
	constructor(data?:CreateReviewTrainingDto,) {
		if (data) {
			this.text = data.text
		}

        this.text = ''
	}

    @ApiProperty({title: 'Review text send by contractor',},)
    @IsString()
    @IsNotEmpty()
	public text:string
}