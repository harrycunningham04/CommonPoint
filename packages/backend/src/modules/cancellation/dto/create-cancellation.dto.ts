import { IsArray, IsOptional, IsString, IsUUID, } from 'class-validator'
import { IsNotEmpty, } from 'class-validator'

export class CreateCancellationDto {
	constructor(data?: CreateCancellationDto,) {
		if (data) {
			this.id = data.id
			this.bookingId = data.bookingId
			this.reason = data.reason
			this.comment = data.comment
			this.attachments = data.attachments
			return
		}

		this.id = null
		this.bookingId = ''
		this.reason = ''
		this.comment = ''
		this.attachments = []
	}

	@IsString()
	@IsOptional()
	@IsUUID()
	public id: string | null

	@IsString()
	@IsNotEmpty()
	public bookingId: string

	@IsString()
	@IsNotEmpty()
	public reason: string

	@IsString()
	@IsNotEmpty()
	public comment: string

	@IsArray()
	@IsString({ each: true, },)
	public attachments: Array<string>
}
