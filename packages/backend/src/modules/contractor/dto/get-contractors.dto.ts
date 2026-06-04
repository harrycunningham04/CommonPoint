import { ApiProperty, } from '@nestjs/swagger'
import { ContractorSkillNama } from '@prisma/client'
import { IsArray, IsBooleanString, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, } from 'class-validator'

export class FilterDto {
    @ApiProperty()
    @IsOptional()
    @IsBooleanString()
	public archived?: string

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public mark?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public region?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public active?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsEnum(ContractorSkillNama, { each: true, },)
    @IsArray()

    public skills?: Array<ContractorSkillNama>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public rating?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public transportations?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsString()
    public sortBy?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public sortDirection?: string
}

export class GetContractorsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
	public page: string = '1'

    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
    public limit: string = '10'

    @ApiProperty()
    @IsOptional()
    @IsString()
    public search?: string

    @ApiProperty()
    @IsOptional()
    public filter?: FilterDto
}

export class ContractorBasicResDto {
	constructor(data?: ContractorBasicResDto,) {
		if (data) {
			this.name = data.name
			this.surname = data.surname
			this.avatar = data.avatar
			this.rating = data.rating
			return
		}
		this.name = ''
		this.surname = ''
		this.avatar = ''
		this.rating = 0
	}

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public name: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public surname: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public avatar: string

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    public rating: number
}
