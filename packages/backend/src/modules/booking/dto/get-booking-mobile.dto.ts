import { ApiProperty, } from '@nestjs/swagger'
import { Type, } from 'class-transformer'
import { IsDate, IsOptional, } from 'class-validator'

export class GetBookingMobileDto {
	constructor(data?: GetBookingMobileDto,) {
		if (data) {
			this.date = data.date
			this.endDate = data.endDate
			return
		}
		this.date = new Date()
	}

  @ApiProperty({
  	type: Date,
  },)
  @IsDate()
  @Type(() => {
  	return Date
  },)
	public date: Date

	@ApiProperty({
		type: Date,
	},)
	@IsDate()
	@Type(() => {
		return Date
	},)
	@IsOptional()
  public endDate?: Date
}