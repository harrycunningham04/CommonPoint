import { Module, } from '@nestjs/common'
import { ReviewService, } from './review.service'
import { JwtModule, } from '../jwt/jwt.module'
import { StatisticTrackingModule, } from '../statistic-tracking/statistic-tracking.module'
import { ReviewController } from './review.controller'

@Module({
	imports:     [JwtModule, StatisticTrackingModule,],
	controllers: [ReviewController,],
	providers:   [ReviewService,],
	exports:     [ReviewService,],
},)
export class ReviewModule {}
