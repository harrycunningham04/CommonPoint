import { IsArray, IsBoolean, IsNumber, ValidateNested, } from 'class-validator'

export class PagedResDto<T> {
	constructor(data?: PagedResDto<T>,) {
		if (data) {
			this.data = data.data
			this.hasNext = data.hasNext
			return
		}
		this.data = []
		this.hasNext = false
	}

  @ValidateNested({ each: true, },)
  @IsArray()
	public data: Array<T>

  @IsBoolean()
  public hasNext: boolean
}

export class PagedResWithCountDto<T> extends PagedResDto<T> {
	constructor(data?: PagedResWithCountDto<T>,) {
		super(data,)
		if (data) {
			this.count = data.count
			return
		}
		this.count = 0
	}

	@IsNumber()
	public count: number
}
