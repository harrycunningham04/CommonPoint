import {
	IsEmail, IsString, Matches,
} from 'class-validator'

import {
	PASSWORD_REGEX,
} from '../../../shared/constants/regexes.constants'

export class SignUpDto {
    @IsEmail()
	public email!: string

	@IsString()
	@Matches(PASSWORD_REGEX,)
    public password!: string
}
