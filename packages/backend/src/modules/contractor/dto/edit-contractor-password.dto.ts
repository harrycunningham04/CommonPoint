/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'

export class EditContractorPasswordDto {
	constructor(data?: EditContractorPasswordDto,) {
		if (data) {
			this.oldPassword = data.oldPassword
			this.newPassword = data.newPassword
			return
		}

		this.oldPassword = ''
		this.newPassword = ''
	}

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
  	type: String,
  },)
	public oldPassword: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
  	type: String,
  },)
  public newPassword: string
}
