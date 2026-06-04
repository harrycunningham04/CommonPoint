import { Module, } from '@nestjs/common'
import { ConfigModule, } from '@nestjs/config'
import { PrismaModule, loggingMiddleware, } from 'nestjs-prisma'
import { Logger, } from '@nestjs/common'
import { ScheduleModule, } from '@nestjs/schedule'

import { AuthModule, } from './modules/auth/auth.module'
import { CryptoModule, } from './modules/crypto/crypto.module'
import { JwtModule, } from './modules/jwt/jwt.module'
import { ForgotPasswordModule, } from './repositories/forgot-password/forgot-password.module'
import { AdminRepModule, } from './repositories/admin/admin.module'
import { AdminModule, } from './modules/admin/admin.module'
import { ForgotPasswordAdminModule, } from './repositories/forgot-password-admin/forgot-password-admin.module'
import { ContractorModule, } from './modules/contractor/contractor.module'
import { TrainingModule, } from './modules/training/training.module'

import { UploadModule, } from './modules/upload/upload.module'
import { ClientsModule, } from './modules/clients/clients.module'
import { DisputesModule, } from './modules/disputes/disputes.module'
import { ProductsModule, } from './modules/products/products/products.module'
import { BookingModule, } from './modules/booking/booking.module'
import { PackagesModule, } from './modules/products/packages/packages.module'
import { CouponsModule, } from './modules/products/coupons/coupons.module'
import { StripeModule, } from './modules/stripe/stripe.module'
import { ContractModule, } from './modules/contract/contract.module'
import { StatisticModule, } from './modules/statistic/statistic.module'
import { DashboardModule, } from './modules/dashboard/dashboard.module'
import { NotificationsModule, } from './modules/notifications/notifications.module'
import { InvoiceModule, } from './modules/invoice/invoice.module'
import { TaskModule, } from './modules/task/task.module'
import { WebhookModule, } from './modules/webhook/webhook.module'
import { RegionsModule, } from './modules/regions/regions.module'
import { RawMaterialModule, } from './modules/raw-material/raw-material.module'
import { CancellationModule, } from './modules/cancellation/cancellation.module'
import { ReviewModule, } from './modules/review/review.module'
import { AvailabilityModule, } from './modules/availability/availability.module'
import { BookingRepositoryModule, } from './repositories/booking/booking.module'
import { StatisticTrackingModule, } from './modules/statistic-tracking/statistic-tracking.module'
import { EarningsModule, } from './modules/earnings/earnings.module'
import { BookingGroupModule, } from './modules/booking-group/booking-group.module'
import { BookingMaterialModule, } from './modules/booking-material/booking-material.module'
import { EditMaterialModule, } from './modules/edit-material/edit-material.module'
import { ContractorAlgorithmModule, } from './modules/contractor-algorithm/contractor-algorithm.module'
import { ESoftModule, } from './modules/esoft/esoft.module'
import { OnesignalModule, } from './modules/onesignal/onesignal.module'

import { AppController, } from './app.controller'
import { AppService, } from './app.service'
import { CalculationModule, } from './modules/calculation/calculation.module'
import { BookingRoutesModule, } from './modules/booking-routes/booking-routes.module'
import { XeroModule } from './modules/xero/xero.module'
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		},),
		PrismaModule.forRoot({
			isGlobal:             true,
			prismaServiceOptions: {
				middlewares: [
					loggingMiddleware({
						logger:   new Logger('PrismaMiddleware',),
						logLevel: 'log',
					},),
				],
			},
		},),
		ScheduleModule.forRoot(),
		CryptoModule,
		AuthModule,
		JwtModule,
		ForgotPasswordModule,
		AdminRepModule,
		AdminModule,
		ForgotPasswordAdminModule,
		ContractorModule,
		ContractModule,
		TrainingModule,
		UploadModule,
		ClientsModule,
		DisputesModule,
		NotificationsModule,
		ProductsModule,
		BookingModule,
		PackagesModule,
		CouponsModule,
		StripeModule,
		StatisticModule,
		DashboardModule,
		InvoiceModule,
		TaskModule,
		WebhookModule,
		RegionsModule,
		RawMaterialModule,
		CancellationModule,
		ReviewModule,
		AvailabilityModule,
		BookingRepositoryModule,
		StatisticTrackingModule,
		EarningsModule,
		BookingGroupModule,
		ContractorAlgorithmModule,
		BookingMaterialModule,
		EditMaterialModule,
		ESoftModule,
		OnesignalModule,
		CalculationModule,
		BookingRoutesModule,
		XeroModule,
	],
	controllers: [
		AppController,
	],
	providers: [
		AppService,
	],
},)

export class AppModule {
}
