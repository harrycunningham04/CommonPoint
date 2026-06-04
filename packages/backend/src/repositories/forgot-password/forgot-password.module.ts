import { Module, } from '@nestjs/common'

import { ForgotPasswordRepository, } from './forgot-password.repository'

@Module({
	providers:   [ForgotPasswordRepository,],
	exports:     [ForgotPasswordRepository,],
},)
export class ForgotPasswordModule {}
