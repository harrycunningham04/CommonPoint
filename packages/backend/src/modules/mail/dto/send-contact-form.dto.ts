import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class SendContactFormDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    public email!: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public details?: string

    @ApiProperty()
    @IsString()
	public address!: string
}
