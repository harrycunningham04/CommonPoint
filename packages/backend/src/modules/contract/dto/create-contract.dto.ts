import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, } from 'class-validator'

export class CreateContractDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public contractorId!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public name!: string

    @ApiProperty()
    @IsOptional()
    public file!: string
}
