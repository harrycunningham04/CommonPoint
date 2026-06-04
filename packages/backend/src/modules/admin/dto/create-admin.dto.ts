import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString, } from 'class-validator'

export class CreateAdminDto {
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
    @IsNotEmpty()
    @IsString()
    public role!: string
}
