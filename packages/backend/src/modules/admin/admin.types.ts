import type { Admin, } from '@prisma/client'

export interface IAdminListReturn {
    admins: Array<Admin>
    maxPage: number
}

export interface IAdminAvailableFilter {
    roles?: Array<string>
    access?: Array<number>
}

export interface IRequestAdmin {
    id: string
    auth: boolean
    isAdmin: boolean
}

export type AccessType = 'Package' | 'Coupon' | 'Sales-statistic'

export enum EAccessType {
    PACKAGE = 'Package',
    COUPON = 'Coupon',
    SALES_STATISTIC = 'Sales-statistic'
}