import { Module, } from '@nestjs/common'
import { BookingMaterialController, } from './controllers/booking-material.controller'
import { BookingMaterialService, } from './services/booking-materials.service'
import { JWTService, } from '../jwt/jwt.service'
import { UploadService, } from '../upload/upload.service'
import { BookingBasicService, } from '../booking/services/booking-basic.service'
import { EditMaterialModule, } from '../edit-material/edit-material.module'
import { RawMaterialModule, } from '../raw-material/raw-material.module'
import { BookingEditedMaterialsService, } from './services/booking-edited-materials.service'
import { AdminBookingMaterialController, } from './controllers/admin-booking-material.controller'
import { NotificationsModule, } from '../notifications/notifications.module'
import { AdminBookingMaterialsService } from './services/admin-booking-materials.service'
import { BookingClientMaterialsService, } from './services/booking-client-materials.service'
import { ClientBookingMaterialController } from './controllers/client-booking-material.controller'
import { BookingGroupModule, } from '../booking-group/booking-group.module'
import { BookingGroupService } from '../booking-group/booking-group.service'
@Module({
	controllers: [BookingMaterialController, AdminBookingMaterialController,ClientBookingMaterialController],
	providers:   [
		BookingMaterialService,
		BookingEditedMaterialsService,
		JWTService,
		UploadService,
		BookingBasicService,
		AdminBookingMaterialsService,
		BookingClientMaterialsService,
		BookingGroupService,
	],
	exports:     [BookingMaterialService,],
	imports:     [EditMaterialModule, RawMaterialModule, NotificationsModule, BookingGroupModule,],
},)

export class BookingMaterialModule {}