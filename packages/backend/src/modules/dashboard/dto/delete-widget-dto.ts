import { ApiProperty, } from '@nestjs/swagger'
import { WidgetSize, WidgetType, } from '@prisma/client'
import { IsEnum, IsOptional, IsString, } from 'class-validator'

export class DeleteWidgetDto {
  @ApiProperty({ enum: WidgetType, },)
  @IsOptional()
  @IsEnum(WidgetType,)
	public widgetType?: WidgetType

  @ApiProperty()
  @IsOptional()
  @IsString()
  public widgetId?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public adminWidgetId?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public position?: string

  @ApiProperty({enum: WidgetSize,},)
  @IsOptional()
  @IsEnum(WidgetSize,)
  public widgetSize?: WidgetSize
}
