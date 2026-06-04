import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsBoolean, } from 'class-validator'

export class ChangeListColumnsDto {
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
	public priority?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public dateTime?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public address?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public contractor?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public stage?: boolean
}

export class ChangeListOrdersColumnsDto {
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
	public priority?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public dateTime?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public contractor?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public stage?: boolean
}