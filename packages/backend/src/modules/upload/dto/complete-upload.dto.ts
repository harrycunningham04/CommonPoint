import { IsArray, IsNotEmpty, IsString, } from 'class-validator'

export class CompleteUploadDto {
	@IsString()
	@IsNotEmpty()
	public uploadId!: string

	@IsString()
	@IsNotEmpty()
	public key!: string

	@IsArray()
	@IsNotEmpty()
	public parts!: Array<{ ETag: string; PartNumber: number }>
}

export class CompleteUploadResponseDto {
	constructor(data: CompleteUploadResponseDto,) {
		this.message = data.message
		this.key = data.key
		this.url = data.url
	}

	@IsString()
	@IsNotEmpty()
	public message!: string

	@IsString()
	@IsNotEmpty()
	public key!: string

	@IsString()
	@IsNotEmpty()
	public url!: string
}

