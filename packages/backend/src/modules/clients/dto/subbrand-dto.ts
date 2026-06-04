import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsUUID, } from 'class-validator'
import { PageSearchCommonDto, } from 'src/shared/dto/page-options.dto'

export class SubbrandDto extends PageSearchCommonDto {
	@ApiProperty({
		description: 'Brand ids',
		type:        Array<string>,
		example:     ['1', '2', '3',],
	},)
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true, },)
	public brandIds?: Array<string>
}

export class SubbrandResponseDto {
	constructor(data?:SubbrandResponseDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.parentBrandId = data.parentBrandId
		}
	}

    @ApiProperty({
    	description: 'Subbrand id',
    	type:        String,
    	example:     '1',
    },)
	@IsNotEmpty()
	public id!: string

    @ApiProperty({
    	description: 'Subbrand name',
    	type:        String,
    	example:     'Subbrand',
    },)
	@IsNotEmpty()
    public name!: string

    @ApiProperty({
    	description: 'Parent brand id',
    	type:        String,
    	example:     '1',
    },)
	@IsNotEmpty()
    public parentBrandId!: string

}