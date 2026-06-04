import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsOptional, IsString, } from 'class-validator'

export class ChangeAdminDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public	role?: string

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    public access?: number

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public archived?: boolean
}
