/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
	HttpException,
	HttpStatus,
	ParseFilePipe,
	MaxFileSizeValidator,
	Body,
	Query,
	Get,
	Delete,
	Res,
} from '@nestjs/common'
import { FileInterceptor, } from '@nestjs/platform-express'
import * as multer from 'multer'
import { UploadService, } from './upload.service'
import { MB, } from 'src/shared/constants'
import { ApiQuery, } from '@nestjs/swagger'
import { Response, } from 'express'
import { Readable, } from 'stream'

interface IUploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('upload',)
export class UploadController {
	constructor(private readonly uploadService: UploadService,) {}

  @Post('avatar',)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage(), },),)
	public async uploadAvatar(
    @UploadedFile(
    	new ParseFilePipe({
    		validators: [
    			new MaxFileSizeValidator({
    				maxSize: MB * 3,
    			},),
    		],
    	},),
    )
    	file: IUploadedFileType,
    @Body('adminId',) adminId: string,
	) {
		if (!file) {
			throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST,)
		}

		if (!adminId) {
			throw new HttpException('Admin ID is required', HttpStatus.BAD_REQUEST,)
		}

		const fileBuffer = file.buffer
		const fileUrl = await this.uploadService.uploadAvatar(
			file.originalname,
			fileBuffer,
		)

		// update avatar URL in the database
		await this.uploadService.updateAvatarInDatabase(adminId, fileUrl,)

		return { url: fileUrl, }
	}

  @Post('file',)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage(), },),)
  public async uploadFile(
    @UploadedFile(
    	new ParseFilePipe({
    		validators: [
    			new MaxFileSizeValidator({
    				maxSize: MB * 10,
    			},),
    		],
    	},),
    )
    	file: IUploadedFileType,
  ): Promise<{ url: string }> {
  	const fileUrl = await this.uploadService.uploadFile(
  		file.originalname,
  		file.buffer,
  	)

  	return { url: fileUrl, }
  }

	@Delete('file',)
	@ApiQuery({ name: 'url', required: true, type: String, },)
  public async deleteFile(@Query('url',) url: string,): Promise<void> {
  	await this.uploadService.deleteFile(url,)
  }

  @Get('download-url',)
	public async getDownloadUrl(@Query('key',) key: string,): Promise<{ url: string }> {
  	const url = await this.uploadService.getSignedUrlData(key,)
  	return { url, }
	}

  @Get('download-urls',)
  public async getDownloadUrls(@Query('keys',) keys: Array<string>,): Promise<{ urls: Array<string> }> {
  	const urls = await this.uploadService.getSignedUrlsData(keys,)
  	return { urls, }
  }

  @Get('put-presigned-url',)
  public async getPutPresignedUrl(@Query('key',) key: string, @Query('fileType',) fileType: string,): Promise<{ url: string }> {
  	const url = await this.uploadService.createPutPresignedUrl(fileType, key,)
  	return { url, }
  }

  @Get('proxy-url',)
  public async getProxyUrl(@Query('url',) url: string, @Res() res: Response,): Promise<void> {
  	if (!url) {
  		res.status(400,).send('Missing url',)
  		return
  	}

  	const decodedUrl = decodeURIComponent(url,)

  	try {
  		const response = await fetch(decodedUrl,)

  		if (!response.ok || !response.body) {
  			res.status(response.status,).send('Failed to fetch file',)
  			return
  		}

  		const contentType = response.headers.get('content-type',) ?? 'application/octet-stream'
  		res.setHeader('Content-Type', contentType,)

  		const readableStream = Readable.fromWeb(response.body as any,)

  		readableStream.pipe(res,)
  	} catch (error) {
  		console.error('Proxy error:', error,)
  		res.status(500,).send('Error proxying file',)
  	}
  }
}
