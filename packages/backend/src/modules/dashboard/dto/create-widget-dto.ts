import { ApiProperty, } from '@nestjs/swagger'
import { WidgetSize, WidgetType, } from '@prisma/client'
import { IsEnum, IsOptional, IsString, } from 'class-validator'

export class CreateAdminWidgetDto {
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
  public prevPosition?: string

  @ApiProperty({enum: WidgetSize,},)
  @IsOptional()
  @IsEnum(WidgetSize,)
  public widgetSize?: WidgetSize
}
