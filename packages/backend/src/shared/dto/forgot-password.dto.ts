import { IsNotEmpty, IsString, IsUUID, Matches, MaxLength, MinLength, } from 'class-validator'
import { PASSWORD_REGEX, } from '../constants/regexes.constants'
import { ApiProperty, } from '@nestjs/swagger'

export class ResetPasswordDto {
	constructor(data?: ResetPasswordDto,) {
		if (data) {
			this.id = data.id
			this.newPassword = data.newPassword
			return
		}
		this.id = ''
		this.newPassword = ''
	}

  @IsUUID()
	@IsNotEmpty()
	@ApiProperty({
		description: 'The id of the user',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	public id: string

	@IsString()
	@Matches(PASSWORD_REGEX,)
	@MinLength(8,)
	@IsNotEmpty()
	@ApiProperty({
		description: 'The new password',
		example:     'password123.',
	},)
  public newPassword: string
}
