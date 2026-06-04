import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'

export class BasicMessageDto {
	constructor(data?: BasicMessageDto,) {
		if (data) {
			this.message = data.message
			return
		}
		this.message = ''
	}

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
  	example:     'This is a message.',
  	description: 'Message',
  },)
	public message: string
}