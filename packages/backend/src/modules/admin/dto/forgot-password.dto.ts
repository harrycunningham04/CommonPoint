import { IsString, IsUUID, Matches, } from 'class-validator'

import { PASSWORD_REGEX, } from '../../../shared/constants/regexes.constants'

export class ResetPasswordDto {
    @IsUUID()
	public id!: string

	@IsString()
	@Matches(PASSWORD_REGEX,)
    public newPassword!: string
}
