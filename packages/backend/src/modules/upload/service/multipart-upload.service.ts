import { Injectable, } from '@nestjs/common'
import { UploadService, } from '../upload.service'
import {
	AbortMultipartUploadCommand,
	CompleteMultipartUploadCommand,
	CreateMultipartUploadCommand,
	UploadPartCommand,
} from '@aws-sdk/client-s3'
import { v4 as uuid4, } from 'uuid'
import { ConfigService, } from '@nestjs/config'
import { PrismaService, } from 'nestjs-prisma'
import { getSignedUrl, } from '@aws-sdk/s3-request-presigner'
import { CreateMultipartUploadResponseDto, } from '../dto/create-multipart-upload.dto'
import { GetPresignedUrlResponseDto } from '../dto/get-presined-url.dto'
import { CompleteUploadResponseDto } from '../dto/complete-upload.dto'
import { AbortUploadResponseDto } from '../dto/abort-upload.dto'
import { generateS3Key } from '../util/generate-s3-key.util'
@Injectable()
export class MultipartUploadService extends UploadService {
	constructor(configService: ConfigService, prisma: PrismaService,) {
		super(configService, prisma,)
	}

	public async createMultipartUpload(fileName: string, fileType: string,): Promise<CreateMultipartUploadResponseDto> {
		const key = generateS3Key(fileName,)

		const command = new CreateMultipartUploadCommand({
			Bucket:      this.bucketName,
			Key:         key,
			ContentType: fileType,
		},)

		const response = await this.s3Client.send(command,)
		return new CreateMultipartUploadResponseDto({
			uploadId: response.UploadId!,
			key,
		},)
	}

	public async getPresignedUrl(
		uploadId: string,
		key: string,
		partNumber: string,
	): Promise<GetPresignedUrlResponseDto> {
		const command = new UploadPartCommand({
			Bucket:     this.bucketName,
			Key:        key,
			UploadId:   uploadId,
			PartNumber: parseInt(partNumber, 10),
		},)

		const presignedUrl = await getSignedUrl(this.s3Client, command, {
			expiresIn: 3600,
		},)
		return new GetPresignedUrlResponseDto({
			presignedUrl,
		},)
	}

	public async completeMultipartUpload(
		uploadId: string,
		key: string,
		parts: Array<{ ETag: string; PartNumber: number }>,
	): Promise<CompleteUploadResponseDto> {
		const command = new CompleteMultipartUploadCommand({
			Bucket:          this.bucketName,
			Key:             key,
			UploadId:        uploadId,
			MultipartUpload: { Parts: parts, },
		},)

		await this.s3Client.send(command,)

		const url = this.linkToS3(key,)
		return new CompleteUploadResponseDto({
			message: 'Upload finished',
			url,
			key,
		},)
	}

	public async abortMultipartUpload(uploadId: string, key: string,): Promise<AbortUploadResponseDto> {
		const command = new AbortMultipartUploadCommand({
			Bucket:   this.bucketName,
			Key:      key,
			UploadId: uploadId,
		},)

		await this.s3Client.send(command,)
		return new AbortUploadResponseDto({
			message: 'Upload aborted',
		},)
	}
}
