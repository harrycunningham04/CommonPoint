import { Module, } from '@nestjs/common'

import { ForgotPasswordAdminRepository, } from './forgot-password-admin.repository'

@Module({
	providers:   [ForgotPasswordAdminRepository,],
	exports:     [ForgotPasswordAdminRepository,],
},)
export class ForgotPasswordAdminModule {}
