import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'

export class ContractorTrainingRequestDto {
	constructor(data?: ContractorTrainingRequestDto,) {
		if (data) {
			this.details = data.details
			this.category = data.category
		}

		this.details = ''
		this.category = ''
	}

  @ApiProperty({ title: 'Training details ', },)
  @IsString()
  @IsNotEmpty()
	public details: string

  @ApiProperty({ title: 'Training category', },)
  @IsString()
  @IsNotEmpty()
  public category: string
}
