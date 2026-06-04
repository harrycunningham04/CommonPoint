import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Matches, } from 'class-validator'
import { PASSWORD_REGEX, } from '../constants/regexes.constants'

export class ChangePasswordDto {
	constructor(data?: ChangePasswordDto,) {
		if (data) {
			this.oldPassword = data.oldPassword
			this.newPassword = data.newPassword
			return
		}
		this.oldPassword = ''
		this.newPassword = ''
	}

	@IsString()
	@Matches(PASSWORD_REGEX,)
  @IsNotEmpty()
  @ApiProperty({
  	example:     'password123.',
  	description: 'User password',
  },)
	public oldPassword: string

	@IsString()
	@Matches(PASSWORD_REGEX,)
  @IsNotEmpty()
  @ApiProperty({
  	example:     'password123.',
  	description: 'User password',
  },)
	public newPassword: string
}
