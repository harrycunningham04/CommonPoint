import { IsBoolean, IsNotEmpty, IsNumber, IsString, } from 'class-validator'
import { BasicContractorDto, } from './basic-contractor.dto'
import { Type, } from 'class-transformer'

export class ContractorDto extends BasicContractorDto {
	constructor(data?: ContractorDto,) {
		super(data,)
		if (data) {
			this.archived = data.archived
			this.rating = data.rating
			this.active = data.active
			this.radius = data.radius
			this.priority = data.priority
			this.name = data.name
			this.surname = data.surname
			this.phone = data.phone
			this.avatar = data.avatar
			this.address = data.address
			return
		}
		this.archived = false
		this.rating = 0
		this.active = false
		this.radius = 0
		this.priority = false
		this.name = ''
		this.surname = ''
    this.phone = null
    this.avatar = null
    this.address = null
	}

  @IsBoolean()
  @IsNotEmpty()
	public archived: boolean

  @IsNumber()
  @Type(() => {
  	return Number
  },)
  public 	rating: number

  @IsBoolean()
  @IsNotEmpty()
  public 	active: boolean

  @IsNumber()
  @Type(() => {
  	return Number
  },)
  public 	radius: number

  @IsBoolean()
  @IsNotEmpty()
  public 	priority: boolean

  @IsString()
  @IsNotEmpty()
  public 	name: string

  @IsString()
  @IsNotEmpty()
  public 	surname: string

  @IsString()
  @IsNotEmpty()
  public 	phone:string | null

  @IsString()
  @IsNotEmpty()
  public 	avatar:string | null

  @IsString()
  @IsNotEmpty()
  public 	address:string | null
}