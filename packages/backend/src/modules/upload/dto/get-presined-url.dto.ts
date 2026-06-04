import { IsNotEmpty, IsNumber, IsString, } from 'class-validator'

export class GetPresignedUrlDto {
	@IsString()
	@IsNotEmpty()
	public uploadId!: string

	@IsString()
	@IsNotEmpty()
	public key!: string

	@IsString()
	@IsNotEmpty()
	public partNumber!: string
}

export class GetPresignedUrlResponseDto {
	constructor(data: GetPresignedUrlResponseDto,) {
		this.presignedUrl = data.presignedUrl
	}

	@IsString()
	@IsNotEmpty()
	public presignedUrl!: string
}
