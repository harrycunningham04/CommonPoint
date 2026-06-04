import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, } from 'class-validator'

export class AvailableStatusDto {
	constructor(data?: AvailableStatusDto,) {
		if (data) {
			this.available = data.available
			return
		}
		this.available = false
	}

  @IsBoolean()
  @ApiProperty({
  	example:     false,
  	description: 'Status of availability',
  },)
	public available: boolean
}