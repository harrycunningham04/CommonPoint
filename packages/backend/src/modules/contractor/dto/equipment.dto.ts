/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { EquipmentType, } from '@prisma/client'
import { IsEnum, IsString, } from 'class-validator'

export class CreateEquipmentDto {
  @ApiProperty({
  	description: 'The type of equipment',
  	example:     'EQUIPMENT_TYPE',
  },)
  @IsEnum(EquipmentType,)
	public equipmentType!: EquipmentType

  @ApiProperty({
  	description: 'The brand of the equipment',
  	example:     'Brand',
  },)
  @IsString()
  public brand!: string

  @ApiProperty({
  	description: 'The model of the equipment',
  	example:     'Model',
  },)
  @IsString()
  public model!: string
}