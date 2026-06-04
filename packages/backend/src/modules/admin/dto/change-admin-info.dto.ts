import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, } from 'class-validator'

export class ChangeAdminInfoDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public email!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public name!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public surname!: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public phone?: string
}
