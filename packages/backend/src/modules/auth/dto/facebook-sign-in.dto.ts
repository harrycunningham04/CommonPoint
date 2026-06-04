import {
	IsString,
} from 'class-validator'

export class FacebookSignInDto  {
	@IsString()
	public code!: string
}
