import { Module, } from '@nestjs/common'
import { ConfigModule, } from '@nestjs/config'
import { UploadService, } from './upload.service'
import { UploadController, } from './upload.controller'
import { MultipartUploadService, } from './service/multipart-upload.service'
import { MultipartUploadController, } from './controllers/multipart-upload.controller'
@Module({
	imports:     [ConfigModule.forRoot(),],
	providers:   [UploadService,MultipartUploadService,],
	controllers: [UploadController,MultipartUploadController,],
	exports:     [UploadService,MultipartUploadService,],
},)
export class UploadModule {}
