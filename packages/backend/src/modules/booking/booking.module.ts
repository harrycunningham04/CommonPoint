import { forwardRef, Module, } from '@nestjs/common'
import { BookingController, } from './controllers/booking.controller'
import { BookingService, } from './services/booking.service'
import { UploadModule, } from '../upload/upload.module'
import { BookingClientController, } from './controllers/booking-client.controller'
import { BookingClientService, } from './services/booking-client.service'
import { JWTService, } from '../jwt/jwt.service'
import { StripeModule, } from '../stripe/stripe.module'
import { InvoiceModule, } from '../invoice/invoice.module'
import { AdminModule, } from '../admin/admin.module'
import { BookingAttachmentService, } from './services/booking-attachment-service'
import { BookingAttachmentController, } from './controllers/booking-attachment.controller'
import { NotificationClientService, } from '../notifications/services/notification-client.service'
import { BookingContractorController, } from './controllers/booking-contractor.controller'
import { BookingContractorService, } from './services/booking-contractor.service'
import { MapService, } from '../map/map.service'
import { RawMaterialModule, } from '../raw-material/raw-material.module'
import { CancellationModule, } from '../cancellation/cancellation.module'
import { ReviewModule, } from '../review/review.module'
import { AvailabilityModule, } from '../availability/availability.module'
import { NotificationsModule, } from '../notifications/notifications.module'
import { StatisticTrackingModule, } from '../statistic-tracking/statistic-tracking.module'
import { BookingBasicService, } from './services/booking-basic.service'
import { MapModule, } from '../map/map.module'
import { ContractorModule, } from '../contractor/contractor.module'
import { BookingCGIService, } from './services/booking-cgi.service'
import { BookingCGIController, } from './controllers/booking-cgi.controller'
import { ContractorAvailabilityWithBookingService, } from './services/booking-contractor-location.service'
import { BookingReviewService, } from './services/booking-review.service'
import { BookingReviewController, } from './controllers/booking-review.controller'
import { BookingRepositoryModule, } from 'src/repositories/booking/booking.module'
import { BookingGroupService, } from 'src/modules/booking-group/booking-group.service'
import { ClientsB2BService, } from '../clients/services/b2b.service'
import { CryptoService, } from '../crypto/crypto.service'
import { MailService, } from '../mail/mail.service'
import { OfficeService, } from '../clients/services/office.service'
import { WorkerService, } from '../clients/services/worker.service'
import { EditMaterialModule, } from '../edit-material/edit-material.module'
import { BookingDraftService, } from './services/booking-draft.service'
import { ClientsB2CService, } from '../clients/services/b2c.service'
import { ProductService, } from '../products/products/products.service'
import { EarningsService, } from '../earnings/earnings.service'
import { ESoftService, } from '../esoft/esoft.service'
import { BookingMaterialModule, } from '../booking-material/booking-material.module'
import { BookingRoutesService, } from '../booking-routes/services/booking-routes.services'
import { ClientBasicService, } from '../clients/services/client-basic.service'
import { PreferencesService } from '../clients/services/preferences-service'
import { ClientDisputeService } from '../disputes/services/client-dispute.service'
import { ConfigModule, } from '@nestjs/config'
import { StripeService } from '../stripe/stripe.service'
import { PackageService } from '../products/packages/packages.service'

@Module({
	exports:     [BookingClientService, BookingBasicService, ContractorAvailabilityWithBookingService,],
	controllers: [BookingController,BookingClientController,BookingAttachmentController,BookingContractorController, BookingCGIController,BookingReviewController,],
	providers:   [BookingService,MapService,BookingClientService,JWTService,BookingAttachmentService,NotificationClientService,BookingContractorService, BookingBasicService,BookingCGIService,ClientsB2BService,
		ContractorAvailabilityWithBookingService,BookingReviewService,BookingGroupService,CryptoService,MailService,OfficeService,WorkerService,
		BookingDraftService,
		ClientsB2CService,
		ProductService,
		EarningsService,
		ESoftService,
		BookingRoutesService,
		ClientBasicService,
		PreferencesService,
		ClientDisputeService,
		StripeService,
		PackageService,
	],
	imports:     [
		UploadModule,
		StripeModule,
		InvoiceModule,
		AdminModule,
		RawMaterialModule,
		CancellationModule,
		ReviewModule,
		AvailabilityModule,
		NotificationsModule,
		StatisticTrackingModule,
		MapModule,
		BookingRepositoryModule,
		EditMaterialModule,
		NotificationsModule,
		BookingMaterialModule,
		ConfigModule,
		forwardRef(() => {
			return 	ContractorModule
		},),
	],
},)
export class BookingModule {}