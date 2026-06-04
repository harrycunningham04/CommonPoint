import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, IsOptional, } from 'class-validator'

export class ChangeListColumnsDto {
	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	public type?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
	public skills?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public mark?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public status?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public address?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public rating?: boolean
}
