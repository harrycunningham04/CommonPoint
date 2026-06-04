import { ApiProperty, } from '@nestjs/swagger'
import { TrainingCategory, } from '@prisma/client'
import { IsEnum, IsOptional, IsString, } from 'class-validator'

export class ChangeTrainingDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public title?: string

    @ApiProperty()
    @IsOptional()
    @IsEnum(TrainingCategory,)
    public category?: TrainingCategory
}
