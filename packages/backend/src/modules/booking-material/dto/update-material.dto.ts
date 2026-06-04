/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { MaterialRawType, } from '@prisma/client'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, } from 'class-validator'

export class UpdateMaterialDto {
    @ApiProperty({
    	description: 'The id of the material to update',
    	example:     '123',
    },)
    @IsNotEmpty()
    @IsArray()
	public materialIds!: Array<string>

    @ApiProperty({
    	description: 'The id of the group to update',
    	example:     '123',
    },)
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    public groupId?: string

    @ApiProperty({
    	description: 'The raw type of the material to update',
    	example:     'RAW',
    },)
    @IsEnum(MaterialRawType,)
    public rawType!: MaterialRawType
}