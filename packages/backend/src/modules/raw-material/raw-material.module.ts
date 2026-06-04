import { Module, } from '@nestjs/common'
import { RawMaterialService, } from './raw-material.service'
import { UploadModule, } from '../upload/upload.module'
@Module({
	providers: [RawMaterialService,],
	exports:   [RawMaterialService,],
	imports:   [UploadModule,],
},)
export class RawMaterialModule {}
