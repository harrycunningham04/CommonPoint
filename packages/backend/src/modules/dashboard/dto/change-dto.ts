import { IsBoolean, IsOptional, IsArray, IsEnum, IsNumber, IsString, } from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { WidgetSize, } from '@prisma/client'

export class UpdateWidgetDto {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
	public isActive?: boolean

  @ApiProperty({enum: WidgetSize,},)
  @IsOptional()
  @IsEnum(WidgetSize,)
  public size?: WidgetSize

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  public position?: number

  @ApiProperty()
  @IsOptional()
  @IsString()
  public adminWidgetId?: string
}

export class UpdateDefaultsDto {
  @ApiProperty()
  @IsArray()
	public widgets!: Array<{
    id : string
    widgetId: string;
    defaultPosition: number;
    defaultIsActive: boolean;
    defaultSize : WidgetSize
  }>
}