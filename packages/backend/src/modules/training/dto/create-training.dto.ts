import { ApiProperty, } from '@nestjs/swagger'
import { TrainingCategory } from '@prisma/client'
import { IsArray, IsNotEmpty, IsOptional, IsString, } from 'class-validator'

export class CreateTrainingDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public title!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public category!: TrainingCategory

    @ApiProperty()
    @IsOptional()
    public file!: string

    @ApiProperty()
    @IsArray()
    public contractors!: Array<string>
}

export class AssignContractorDto {
    @ApiProperty()
    @IsArray()
    public contractors!: Array<string>
}
