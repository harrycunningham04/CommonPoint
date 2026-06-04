import {
	IsNotEmpty, IsString, Matches,
} from 'class-validator'
import { PASSWORD_REGEX, } from '../constants/regexes.constants'
import { ApiProperty, } from '@nestjs/swagger'

export class BasicPasswordCheckDto {
	constructor(data?: BasicPasswordCheckDto,) {
		if (data) {
			this.password = data.password
			return
		}
		this.password = ''
	}

	@IsString()
	@Matches(PASSWORD_REGEX,)
  @IsNotEmpty()
  @ApiProperty({
  	example:     'password123.',
  	description: 'User password',
  },)
	public password: string
}
