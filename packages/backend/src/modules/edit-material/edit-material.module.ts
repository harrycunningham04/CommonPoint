import { Module, } from '@nestjs/common'
import { EditMaterialService, } from './edit-material.service'
import { PrismaModule, } from 'nestjs-prisma'
import { ESoftModule, } from '../esoft/esoft.module'

@Module({
	providers: [EditMaterialService,],
	exports:   [EditMaterialService,],
	imports:   [PrismaModule, ESoftModule,],
},)
export class EditMaterialModule {}
