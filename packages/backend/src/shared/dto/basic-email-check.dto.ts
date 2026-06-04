import { ApiProperty, } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, } from 'class-validator'

export class BasicEmailCheckDto {
	constructor(params?: BasicEmailCheckDto,) {
		if (params) {
			this.email = params.email
			return
		}
		this.email = ''
	}

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
  	example:     'test@gmail.com',
  	description: 'User email',
  },)
	public email: string
}