import { ApiProperty, } from '@nestjs/swagger'
import type { Worker, } from '@prisma/client'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

export class WorkerResponseDto {
	constructor(data?: WorkerResponseDto,) {
		if (data) {
			this.id = data.id
			this.firstName = data.firstName
			this.lastName = data.lastName
			this.email = data.email
			this.password = data.password
			this.phoneNumber = data.phoneNumber
			this.role = data.role
			this.createdAt = data.createdAt
			this.updatedAt = data.updatedAt
		}
	}

	@ApiProperty({
		description: 'The id of the worker',
		example:     '123',
	},)
	public id!: string

	@ApiProperty({
		description: 'The first name of the worker',
		example:     'John',
	},)
	public firstName!: string

	@ApiProperty({
		description: 'The last name of the worker',
		example:     'Doe',
	},)
	public lastName!: string

	@ApiProperty({
		description: 'The email of the worker',
		example:     'john.doe@example.com',
	},)
	public email!: string

	@ApiProperty({
		description: 'The password of the worker (hashed)',
		example:     'hashed_password_string',
	},)
	public password!: string

	@ApiProperty({
		description: 'The phone number of the worker',
		example:     '+1234567890',
	},)
	public phoneNumber!: string

	@ApiProperty({
		description: 'The role of the worker',
		example:     'admin',
	},)
	public role!: string

	@ApiProperty({
		description: 'The creation date of the worker',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public createdAt!: Date

	@ApiProperty({
		description: 'The last update date of the worker',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public updatedAt!: Date

	public static cast(worker: Worker,) : WorkerResponseDto {
		return new WorkerResponseDto({
			id:          worker.id,
			firstName:   worker.firstName,
			lastName:    worker.lastName,
			email:       worker.email,
			password:    worker.password,
			phoneNumber: worker.phoneNumber,
			role:        worker.role,
			createdAt:   worker.created_at,
			updatedAt:   worker.updated_at,
		},)
	}
}

export class PagedWorkersResponseDto implements PagedResDto<WorkerResponseDto> {
	@ApiProperty({
		description: 'Array of workers',
		type:        [WorkerResponseDto,],
	},)
	public data!: Array<WorkerResponseDto>

	@ApiProperty({
		description: 'Whether there are more pages',
		example:     true,
	},)
	public hasNext!: boolean
}
