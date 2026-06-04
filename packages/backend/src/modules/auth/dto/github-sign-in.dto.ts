import {
	IsString,
} from 'class-validator'

export class GithubSignInDto  {
	@IsString()
	public code!: string
}
