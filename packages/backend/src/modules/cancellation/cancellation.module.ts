import { Module, } from '@nestjs/common'
import { CancellationService, } from './cancellation.service'

@Module({
	providers: [CancellationService,],
	exports:   [CancellationService,],
},)
export class CancellationModule {}
