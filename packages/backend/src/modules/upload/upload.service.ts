import { v4 as uuid4, } from 'uuid'
import sharp from 'sharp'
import { Injectable, InternalServerErrorException, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import { PrismaService, } from 'nestjs-prisma'
import type { S3ClientConfig, } from '@aws-sdk/client-s3'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client, } from '@aws-sdk/client-s3'
import fs from 'fs'
import { mimeTypes, type UploadedFile, } from './upload.types'
import { getSignedUrl, } from '@aws-sdk/s3-request-presigner'

@Injectable()
export class UploadService {
	public readonly s3Client: S3Client

	public readonly bucketName: string

	constructor(
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
	) {
		const region = this.configService.get<string>('AWS_S3_REGION',)
		const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY',)
		const secretAccessKey = this.configService.get<string>(
			'AWS_SECRET_ACCESS_KEY',
		)
		const bucketName = this.configService.get<string>('AWS_BUCKET_NAME',)
		if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
			throw new InternalServerErrorException('Missing AWS S3 configuration',)
		}

		this.bucketName = bucketName

		const s3Config: S3ClientConfig = {
			region,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		}
		this.s3Client = new S3Client(s3Config,)
		// const url = await getSignedUrl(this.s3Client,)
	}

	public linkToS3(key: string,): string {
		return `https://${this.bucketName}.s3.amazonaws.com/${key}`
	}

	public async uploadAvatar(fileName: string, file: Buffer,): Promise<string> {
		const id: string = uuid4()

		const compressedFile = await sharp(file,).webp({ quality: 90, },)
			.toBuffer()

		const s3Key = `${id}-${fileName}`
		const encodeFileName = encodeURIComponent(s3Key,)

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key:    s3Key,
				Body:   compressedFile,
			},),
		)
		return this.linkToS3(encodeFileName,)
	}

	public async uploadFile(fileName: string, file: Buffer,): Promise<string> {
		const id: string = uuid4()

		const s3Key = `${id}-${fileName}`
		const encodeFileName = encodeURIComponent(s3Key,)

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key:    s3Key,
				Body:   file,
			},),
		)
		return this.linkToS3(encodeFileName,)
	}

	private getTypeFromBase64(base64String: string,): string {
		const typePart = base64String.split(',',).at(0,) ?? ''

		const mimeType = typePart.split(';',).at(0,)
			?.split(':',)
			.at(1,)

		return mimeType ?? ''
	}

	private toArrayBuffer(buffer: Buffer,): ArrayBuffer {
		const arrayBuffer = new ArrayBuffer(buffer.length,)
		const view = new Uint8Array(arrayBuffer,)
		for (let i = 0; i < buffer.length; ++i) {
			view[i] = buffer[i] ?? 0
		}
		return arrayBuffer
	}

	public async uploadBase64(fileName: string, file: string,): Promise<string> {
		const id: string = uuid4()

		let data: string
		let contentType: string | undefined
		let extension: string | undefined

		const match = (/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/).exec(file,)
		if (match) {
			contentType = match[1] ?? ''
			data = match[2] ?? ''
			extension = contentType.split('/',)[1] ?? ''
		} else {
			throw new InternalServerErrorException(
				'Could not detect image type of the uploaded data',
			)
		}

		const s3Key = `${id}-${fileName}.${extension}`
		const buffer = Buffer.from(data, 'base64',)

		const encodeFileName = encodeURIComponent(s3Key,)

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket:          this.bucketName,
				Key:             s3Key,
				Body:            buffer,
				ContentEncoding: 'base64',
				ContentType:     contentType,
			},),
		)
		return this.linkToS3(encodeFileName,)
	}

	public async deleteFile(url: string,): Promise<void> {
		const key = url.split('.com/',)[1] ?? ''
		await this.s3Client.send(
			new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key:    decodeURIComponent(key,),
			},),
		)
	}

	public async updateAvatarInDatabase(adminId: string, avatarUrl: string,) {
		return this.prisma.admin.update({
			where: { id: adminId, },
			data:  { avatar: avatarUrl, },
		},)
	}

	public async uploadLocalFileToS3(
		filePath: string,
		fileName: string,
	): Promise<UploadedFile> {
		const fileBuffer = fs.readFileSync(filePath,)
		const id: string = uuid4()
		const name = fileName
		const s3Key = `${id}-${name}`
		const encodeFileName = encodeURIComponent(s3Key,)

		const fileExt = name.split('.',)[1] ?? 'other'
		const contentType = mimeTypes[fileExt] ?? ''

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket:             this.bucketName,
				Key:                s3Key,
				Body:               fileBuffer,
				ContentType:        contentType,
				ContentDisposition: 'inline',
			},),
		)

		const url = `https://${this.bucketName}.s3.amazonaws.com/${encodeFileName}`

		fs.unlink(filePath, () => {},)

		return {
			url,
			name,
			contentType,
		}
	}

	public async getSignedUrlData(key: string,): Promise<string> {
		const command = new GetObjectCommand({
		  Bucket: this.bucketName,
		  Key:    key,
		},)

		// @ts-ignore
		return await getSignedUrl(this.s3Client, command, { expiresIn: 3600, },)
	  }

	  public async getSignedUrlsData(keys: Array<string>,): Promise<Array<string>> {
		return Promise.all(
			keys.map(async(key,) => {
				const command = new GetObjectCommand({
					Bucket: this.bucketName,
					Key:    key,
				},)

				return  getSignedUrl(this.s3Client, command, { expiresIn: 3600, },)
			},),
		)
	}

	public async createPutPresignedUrl(fileType: string, key: string,): Promise<string> {
		const command = new PutObjectCommand({
			Bucket:      this.bucketName,
			Key:         key,
			ContentType: fileType,
		},)

		return  getSignedUrl(this.s3Client, command, { expiresIn: 3600, },)
	}
}
