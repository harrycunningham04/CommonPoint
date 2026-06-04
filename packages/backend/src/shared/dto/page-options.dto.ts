import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, } from 'class-validator'
import { Type, } from 'class-transformer'
import { ApiProperty, } from '@nestjs/swagger'

export class PageOptionsDto {
	constructor(data?: PageOptionsDto,) {
		if (!data) {
			this.page = 1
			this.limit = 10
			return
		}
		this.page = data.page
		this.limit = data.limit
	}

	public static cast(data: any,): PageOptionsDto {
		const item = new PageOptionsDto()
		item.page = data.page
		item.limit = data.limit
		return item
	}

  @ApiProperty({
  	description: 'Page number',
  	type:        Number,
  	example:     1,
  },)
  @IsNotEmpty()
  @Type(() => {
  	return Number
  },)
  @IsInt()
  @Min(1,)
	protected page: number

  @ApiProperty({
  	description: 'Number of items per page',
  	type:        Number,
  	example:     10,
  },)
  @IsNotEmpty()
  @Type(() => {
  	return Number
  },)
  @IsInt()
  @Min(1,)
  protected limit: number

  public get skip(): number {
  	return (this.page - 1) * this.limit
  }

  public set skip(value: number,) {
  	this.page = Math.floor(value / this.limit,) + 1
  }

  public get take(): number {
  	return this.limit
  }

  public set take(value: number,) {
  	this.limit = value
  }
}

export class PageSearchOptionsDto extends PageOptionsDto {
	constructor(data?: PageSearchOptionsDto,) {
		super(data,)
		if (data) {
			this.search = data.search
			return
		}
		this.search = ''
	}

	@ApiProperty({
		description: 'Search query',
		type:        String,
		example:     'search',
	},)
	@IsString()
	@IsNotEmpty()
	public search: string
}

export class PageSearchDto  {
	constructor(data?: PageSearchDto,) {
		if (data) {
			this.search = data.search
			this.isOffSite = data.isOffSite
			return
		}
		this.search = ''
		this.isOffSite = false
	}

	@ApiProperty({
		description: 'Search query',
		type:        String,
		example:     'search',
	},)
	@IsString()
	public search: string

	@ApiProperty({
		description: 'Is off site',
		type:        Boolean,
		example:     false,
	},)
	@Type(() => {
		return Boolean
	},)
	@IsBoolean()
	public isOffSite: boolean
}


export class PageSearchCommonDto {
	constructor(data?: PageSearchDto,) {
		if (data) {
			this.search = data.search
			return
		}
	}


	@ApiProperty({
		description: 'Search query',
		type:        String,
		example:     'search',
	},)
	@IsString()
	public search!: string
}