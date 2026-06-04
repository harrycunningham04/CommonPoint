import {
	IsNotEmpty, IsString,
	MinLength,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { BasicEmailCheckDto, } from './basic-email-check.dto'

export class SignInDto extends BasicEmailCheckDto {
	constructor(data?: SignInDto,) {
		super(data,)
		if (data) {
			this.password = data.password
			return
		}
		this.password = ''
	}

	@IsString()
	@MinLength(8,)
	@IsNotEmpty()
	@ApiProperty({
		example:     'password123.',
		description: 'User password',
	},)
	public password: string
}
