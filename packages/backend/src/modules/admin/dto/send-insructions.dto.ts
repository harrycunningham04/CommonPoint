import { IsEmail, } from 'class-validator'

export class SendInstructionsDto {
    @IsEmail()
	public email!: string
}
