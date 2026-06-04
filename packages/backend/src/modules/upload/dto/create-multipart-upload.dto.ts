import { IsNotEmpty, IsString, } from 'class-validator'

export class CreateMultipartUploadDto {
	@IsString()
	@IsNotEmpty()
	public fileName!: string

	@IsString()
	@IsNotEmpty()
	public fileType!: string
}

export class CreateMultipartUploadResponseDto {
	constructor(data: CreateMultipartUploadResponseDto,) {
		this.uploadId = data.uploadId
		this.key = data.key
	}

	@IsString()
	@IsNotEmpty()
	public uploadId!: string

	@IsString()
	@IsNotEmpty()
	public key!: string
}
