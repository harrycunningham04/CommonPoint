import { IsNotEmpty, IsString, } from 'class-validator'

export class AbortUploadDto {
	@IsString()
	@IsNotEmpty()
	public uploadId!: string

	@IsString()
	@IsNotEmpty()
	public key!: string
}

export class AbortUploadResponseDto {
	constructor(data: AbortUploadResponseDto,) {
		this.message = data.message
	}

	@IsString()
	@IsNotEmpty()
	public message!: string
}

