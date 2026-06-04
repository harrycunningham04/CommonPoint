import type { EarningRateType, } from '@prisma/client'

export type BookingForCalculation = {
  BookingToProductType: Array<{
    productType: {
      price: number,
      earningRate?: {
        rateType:    EarningRateType,
        earningRate: number,
      },
    },
  }>,
}