/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { BookingStatus, Prisma, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import { BookingRepository, } from 'src/repositories/booking/booking.repository'

@Injectable()
export class CalculationService {
	constructor(
    private readonly prisma: PrismaService,
    public readonly bookingRepository: BookingRepository,
	) {}

	// public async calculateBasicContractorPayment({
	// 	startDate,
	// 	endDate,
	// 	contractorId,
	// 	isAdditionalPayment,
	// }: {
	//   startDate: Date,
	//   endDate: Date,
	//   contractorId: string,
	//   isAdditionalPayment: boolean,
	// },): Promise<number> {
	// 	const field = isAdditionalPayment ?
	// 		prisma.sql`"additionalProductTypeId"` :
	// 		prisma.sql`"defaultRateProductTypeId"`
	// 	const earning = await this.prisma.$queryRaw<Array<{
	//     earning: bigint,
	//   }>>`
	//     sELECT
	//       sUM(
	//       cASE
	//         wHEN er."rateType" = 'PERCENTAGE'::"EarningRateType" THEN
	//           (er."earningRate" / 100.0) * pt."price"
	//         eLSE
	//           er."earningRate"
	//       eND
	//       ) as earning
	//     from "EarningRate" as er
	//     jOIN "ProductType" as pt ON pt."id" = er.${field}
	//     wHERE
	//       er.${field} IN (
	//         sELECT
	//           product_type_id
	//         fROM
	//           booking_to_product_type
	//         wHERE
	//           booking_id IN (
	//             sELECT
	//               id
	//             fROM
	//               "Booking"
	//             wHERE
	//               "date_time" >= ${startDate}
	//               aND "date_time" < ${endDate}
	//               aND "contractorId" = ${contractorId}::uuid
	//           )
	//       )
	//   `

	// 	return Math.round(Number(earning[0]?.earning ?? 0,) * 100,) / 100
	// }

	// 	public async calculateBasicContractorPayment({
	// 		startDate,
	// 		endDate,
	// 		contractorId,
	// 	}: {
	//     startDate: Date;
	//     endDate: Date;
	//     contractorId: string;
	//   },): Promise<number> {
	// 		const calculateEarning = async(field: 'defaultRateProductTypeId' | 'additionalProductTypeId',) => {
	// 			const fieldSql = Prisma.sql([`"${field}"`,],)
	// 			const earning = await this.prisma.$queryRaw<Array<{
	//         earning: bigint;
	//       }>>`
	//         sELECT
	//           sUM(
	//           cASE
	//             wHEN er."rateType" = 'PERCENTAGE'::"EarningRateType" THEN
	//               (er."earningRate" / 100.0) * pt."price"
	//             eLSE
	//               er."earningRate"
	//           eND
	//           ) as earning
	//         from "EarningRate" as er
	//         jOIN "ProductType" as pt ON pt."id" = er.${fieldSql}
	//         wHERE
	//           er.${fieldSql} IN (
	//             sELECT
	//               product_type_id
	//             fROM
	//               booking_to_product_type
	//             wHERE
	//               booking_id IN (
	//                 sELECT
	//                   id
	//                 fROM
	//                   "Booking"
	//                 wHERE
	//                   "date_time" >= ${startDate}
	//                   aND "date_time" < ${endDate}
	//                   aND "contractorId" = ${contractorId}::uuid
	//               )
	//           )
	//       `

	// 			return Math.round(Number(earning[0]?.earning ?? 0,) * 100,) / 100
	// 		}
	// 		const defaultPayment = await calculateEarning('defaultRateProductTypeId',)
	// 		const additionalPayment = await calculateEarning('additionalProductTypeId',)

	// 		return Math.round((defaultPayment + additionalPayment) * 100,) / 100
	// 	}

	public async calculateBasicContractorPayment({
		startDate,
		endDate,
		contractorId,
	}: {
    startDate: Date;
    endDate: Date;
    contractorId: string;
  },): Promise<number> {
		const bookings = await this.prisma.booking.findMany({
			where: {
				booking_status:     BookingStatus.DONE,
				isContractorPaid:   false,
				bookingCompletedAt: {
					gte: startDate,
					lt:  endDate,
				},
				OR: [
					{
						contractorId,
					},
					{
						BookingToProductType: {
							some: {
								productType: {
									additionalProduct: {
										contractorId,
									},
								},
							},
						},
					},
				],
			},
			include: {
				BookingToProductType: {
					include: {
						productType: {
							include: {
								earningRate:       true,
								additionalProduct: {
									include: {
										earningRate: true,
									},
								},
							},
						},
					},
				},
			},
		},)

		let totalEarning = 0

		for (const booking of bookings) {
			for (const btpt of booking.BookingToProductType) {
				const pt = btpt.productType
				const { price, } = pt

				const apt = pt.additionalProduct
				const aptER = apt?.earningRate

				if (apt?.contractorId === contractorId && aptER) {
					totalEarning =
            totalEarning +
            (aptER.rateType === 'PERCENTAGE' ?
            	(aptER.earningRate / 100) * price :
            	aptER.earningRate)
				}

				const ptER = pt.earningRate
				if (booking.contractorId === contractorId && ptER) {
					totalEarning =
            totalEarning +
            (ptER.rateType === 'PERCENTAGE' ?
            	(ptER.earningRate / 100) * price :
            	ptER.earningRate)
				}
			}
		}

		return Math.round(totalEarning * 100,) / 100
	}

	public async calculateBookingContractorPayment(
		bookingId: string,
	): Promise<number> {
		const calculateEarning = async(
			field: 'defaultRateProductTypeId' | 'additionalProductTypeId',
		) => {
			const fieldSql = Prisma.sql([`"${field}"`,],)
			const earning = await this.prisma.$queryRaw<
        Array<{
          earning: bigint;
        }>
      >`
			SELECT
			  SUM(
				CASE
				  WHEN er."rateType" = 'PERCENTAGE'::"EarningRateType" THEN
					(er."earningRate" / 100.0) * pt."price"
				  ELSE
					er."earningRate"
				END
			  ) as earning
			FROM "EarningRate" as er 
			JOIN "ProductType" as pt ON pt."id" = er.${fieldSql}
			WHERE
			  er.${fieldSql} IN (
				SELECT product_type_id
				FROM booking_to_product_type
				WHERE booking_id = ${bookingId}::uuid
			  )
		  `

			return Math.round(Number(earning[0]?.earning ?? 0,) * 100,) / 100
		}
		const defaultPayment = await calculateEarning('defaultRateProductTypeId',)
		const additionalPayment = await calculateEarning('additionalProductTypeId',)

		return Math.round((defaultPayment + additionalPayment) * 100,) / 100
	}
}
