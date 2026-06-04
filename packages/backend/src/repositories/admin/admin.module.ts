import { Module, } from '@nestjs/common'

import { AdminRepository, } from './admin.reposiitory'

@Module({
	providers:   [AdminRepository,],
	exports:     [AdminRepository,],
},)
export class AdminRepModule {}
