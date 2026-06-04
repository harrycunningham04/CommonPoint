/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Post, Body, Get, Query, Delete, } from '@nestjs/common'
import { MultipartUploadService, } from '../service/multipart-upload.service'
import type { CreateMultipartUploadResponseDto, } from '../dto/create-multipart-upload.dto'
import { CreateMultipartUploadDto, } from '../dto/create-multipart-upload.dto'
import type { GetPresignedUrlResponseDto,} from '../dto/get-presined-url.dto'
import { GetPresignedUrlDto, } from '../dto/get-presined-url.dto'
import type { CompleteUploadResponseDto,} from '../dto/complete-upload.dto'
import { CompleteUploadDto, } from '../dto/complete-upload.dto'
import type { AbortUploadResponseDto,} from '../dto/abort-upload.dto'
import { AbortUploadDto, } from '../dto/abort-upload.dto'

@Controller('upload/multipart',)
export class MultipartUploadController {
	constructor(private readonly multipartUploadService: MultipartUploadService,) {}

    @Post('create',)
	public async createMultipartUpload(@Body() body: CreateMultipartUploadDto,): Promise<CreateMultipartUploadResponseDto> {
		return this.multipartUploadService.createMultipartUpload(body.fileName, body.fileType,)
	}

    @Get('presigned-url',)
    public async getPresignedUrl(@Query() query: GetPresignedUrlDto,): Promise<GetPresignedUrlResponseDto> {
    	return this.multipartUploadService.getPresignedUrl(query.uploadId, query.key, query.partNumber,)
    }

	@Post('complete-upload',)
    public async completeUpload(@Body() body: CompleteUploadDto,): Promise<CompleteUploadResponseDto> {
    	return this.multipartUploadService.completeMultipartUpload(body.uploadId, body.key, body.parts,)
    }

	@Delete('abort-upload',)
	public async abortUpload(@Body() body: AbortUploadDto,): Promise<AbortUploadResponseDto> {
		return this.multipartUploadService.abortMultipartUpload(body.uploadId, body.key,)
	}
}
