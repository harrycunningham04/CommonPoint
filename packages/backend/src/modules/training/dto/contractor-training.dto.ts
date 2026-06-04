/* eslint-disable no-mixed-spaces-and-tabs */
import type { ContractorTraining, Training, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, } from 'class-validator'

export class BasicTrainingDto {
	constructor(data?: Partial<BasicTrainingDto>,) {
		if (data) {
			this.id = data.id ?? ''
			this.category = data.category ?? ''
			this.file = data.file ?? ''
			this.title = data.title ?? ''
			this.completed = data.completed ?? false
		}
	}

	@IsUUID()
	@IsNotEmpty()
	public id!:string

  @IsString()
  @IsNotEmpty()
	public title!: string

  @IsString()
  @IsNotEmpty()
  public category!: string

  @IsString()
  @IsOptional()
  public file!: string

  @IsBoolean()
  public completed!: boolean
}

export class TrainingResponseDto {
  @IsArray()
  @ValidateNested({ each: true, },)
  @Type(() => {
  	return BasicTrainingDto
  },)
	public trainings: Array<BasicTrainingDto>

  constructor(trainings: Array<ContractorTraining & { training: Training }>,) {
  	this.trainings = trainings.map(
  		(training,) => {
  			return new BasicTrainingDto({
  				id:        training.training.id,
  				title:     training.training.title,
  				category:  training.training.category,
  				file:      training.training.file ?? '',
  				completed: training.completed,
  			},)
  		},
  	)
  }

  public static cast(trainings: Array<ContractorTraining & { training: Training }>,): TrainingResponseDto {
  	return new TrainingResponseDto(trainings,)
  }
}
