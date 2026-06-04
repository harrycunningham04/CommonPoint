import { IsNotEmpty, IsString, } from 'class-validator'

export class StripeCallbackDto {
	constructor(data?:StripeCallbackDto,) {
		if (data) {
			this.code = data.code
			return
		}
		this.code = ''
	}

  @IsString()
  @IsNotEmpty()
	public	code: string
}