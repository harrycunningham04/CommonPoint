import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'
import { BasicEmailCheckDto, } from 'src/shared/dto/basic-email-check.dto'

export class BasicContractorDto extends BasicEmailCheckDto {
	constructor(data?: BasicContractorDto,) {
		super(data,)
		if (data) {
			this.id = data.id
			return
		}
		this.id = ''
	}

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
  	description: 'Contractor id',
  	example:     '1',
  },)
	public id: string
}

