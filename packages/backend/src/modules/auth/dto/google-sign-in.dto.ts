import {
	IsString,
} from 'class-validator'

export class GoogleSignInDto  {
	@IsString()
	public code!: string
}
