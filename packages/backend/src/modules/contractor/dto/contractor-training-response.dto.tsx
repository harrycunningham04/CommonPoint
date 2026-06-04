import { ApiProperty, } from '@nestjs/swagger'
import { TrainingCategory,} from '@prisma/client'
import type { ContractorTraining, Training, } from '@prisma/client'
import { IsBoolean, IsDate, IsString, } from 'class-validator'

export class ContractorTrainingResponseDto {
	constructor(data?: ContractorTrainingResponseDto,) {
		if (data) {
			this.id = data.id
			this.createdAt = data.createdAt
			this.updatedAt = data.updatedAt
			this.title = data.title
			this.completed = data.completed
			this.category = data.category
			this.url = data.url
		}
	}

	@ApiProperty({
		description: 'The id of the contractor training',
		example:     '123',
	},)
	@IsString()
	public id!: string

	@ApiProperty({
		description: 'The created at date of the contractor training',
		example:     '2021-01-01',
	},)
	@IsDate()
	public createdAt!: Date

	@ApiProperty({
		description: 'The updated at date of the contractor training',
		example:     '2021-01-01',
	},)
	@IsDate()
	public updatedAt!: Date

	@ApiProperty({
		description: 'The training of the contractor training',
		example:     '123',
	},)
	@IsString()
	public title!: string

	@ApiProperty({
		description: 'The completed status of the contractor training',
		example:     true,
	},)
	@IsBoolean()
	public completed!: boolean

	@ApiProperty({
		description: 'The category of the contractor training',
		example:     '123',
	},)
	@IsString()
	public category!: TrainingCategory

	@ApiProperty({
		description: 'The url of the contractor training',
		example:     'https://www.google.com',
	},)
	@IsString()
	public url!: string

	public static cast(data: ContractorTraining & { training: Training,},): ContractorTrainingResponseDto {
		return new ContractorTrainingResponseDto({
			id:        data.training_id,
			createdAt: data.training.created_at,
			updatedAt: data.training.updated_at,
			title:     data.training.title,
			completed: data.completed,
			category:  data.training.category,
			url:       data.training.file ?? '',
		},)
	}
}
