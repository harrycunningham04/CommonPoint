import { IsNotEmpty, IsString, } from 'class-validator'

export class ChangePasswordDto {
	@IsString()
	@IsNotEmpty()
	public oldPassword!: string

	@IsString()
	@IsNotEmpty()
	public newPassword!: string
}
