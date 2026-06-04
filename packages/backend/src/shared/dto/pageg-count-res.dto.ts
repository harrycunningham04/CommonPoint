import { Type, } from 'class-transformer'
import { IsArray, IsBoolean, IsNumber, IsOptional, ValidateNested, } from 'class-validator'

export class PagedCountResDto<T> {
	constructor(data?: PagedCountResDto<T>,) {
		if (data) {
			this.data = data.data
			this.count = data.count
			this.hasNext = data.hasNext

			return
		}
		this.data = []
		this.count = 0
		this.hasNext = false
	}

  @ValidateNested({ each: true, },)
  @IsArray()
	public data: Array<T>

  @IsNumber()
  @Type(() => {
  	return Number
  },)
  public count: number

    @IsBoolean()
	@IsOptional()
	public hasNext?: boolean
}