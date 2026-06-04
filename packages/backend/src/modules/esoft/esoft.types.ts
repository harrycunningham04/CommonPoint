/* eslint-disable no-redeclare */
export const ESoftProductTypes = {
	PHOTO: 'PHOTO',
	VIDEO: 'VIDEO',
} as const

export type ESoftProductTypes =
    (typeof ESoftProductTypes)[keyof typeof ESoftProductTypes]

export const ProductUnit = {
	PCS:   'Pcs',
	FLOOR: 'Floor',
} as const
export type ProductUnit = (typeof ProductUnit)[keyof typeof ProductUnit]

export interface IMaterialHttpFile {
    name: string
    size: number
    url: string
}

export interface IOrderLineRequest {
    productId: string
    variant: string
    quantity: number
    unit?: ProductUnit
    subClientGroupId?: string
    subClientId?: string
    externalId?: string
    requireBooking?: boolean
    allowPartDelivery?: boolean
    comments?: Array<string>
    autoMarkBatchReady?: boolean
    httpFiles?: Array<IMaterialHttpFile>
}

export interface ICreateOrderList {
    clientId: string
    reference: string
    receivingCompany: string
    orderLines: Array<IOrderLineRequest>
}

export interface ICreateOrderCorrectionList {
    clientId: string
    orderLineId: number
    quantity: number
    comments: Array<string>
    httpFiles?: Array<IMaterialHttpFile>
}

export interface IOrderResponse {
    orderId: number
    orderLines: Array<IOrderLineResponse>
}

export interface IOrderLineResponse {
    productId: string
    variant: string
    orderLineId: number
    quantity?: number
    externalId?: string
    productName?: string | null
    autoMarkBatchReady?: boolean
}

export const ESoftNotificationTypes = {
	ORDER_CREATED:        'ORDER_CREATED',
	ORDER_CREATION_ERROR: 'ORDER_CREATION_ERROR',
	DELIVERY:             'DELIVERY',
} as const

export type ESoftNotificationTypes =
    (typeof ESoftNotificationTypes)[keyof typeof ESoftNotificationTypes]

export const ESoftAssetsState = {
	ACTIVE:    'ACTIVE',
	ARCHIVING: 'ARCHIVING',
	RESTORING: 'RESTORING',
	ARCHIVED:  'ARCHIVED',
} as const

export type ESoftAssetsState =
    (typeof ESoftAssetsState)[keyof typeof ESoftAssetsState]

export const ESoftReferenceType = {
	CASE:        'CASE',
	LOCATION:    'LOCATION',
	PORTRAIT:    'PORTRAIT',
	GROUP:       'GROUP',
	SHOP:        'SHOP',
	INTRO_OUTRO: 'INTRO_OUTRO',
} as const

export type ESoftReferenceType =
    (typeof ESoftReferenceType)[keyof typeof ESoftReferenceType]

export const ESoftOrientation = {
	VERTICAL:   'VERTICAL',
	HORIZONTAL: 'HORIZONTAL',
	SQUARE:     'SQUARE',
} as const

export type ESoftOrientation =
    (typeof ESoftOrientation)[keyof typeof ESoftOrientation]

export const ESoftPictureFormat = {
	JPG: 'JPG',
	PNG: 'PNG',
	PDF: 'PDF',
	SVG: 'SVG',
} as const

export type ESoftPictureFormat =
    (typeof ESoftPictureFormat)[keyof typeof ESoftPictureFormat]
export interface IESoftAssets {
    state: ESoftAssetsState
    pictures: Array<IEsoftPicture>
    videos: Array<IEsoftVideo>
}
export interface IEsoftPicture {
    batchId: number
    correctedAsset: boolean
    id: number
    orderType: string
    rootOrderLineId: number
    orderLineId: number
    updatedDate: string
    listOrder: number
    description: string
    tags: Array<string>
    name: string
    referenceType: ESoftReferenceType
    orientation: ESoftOrientation
    assets: Array<IEsoftPictureAsset>
    selfEditLink: string
}

export interface IEsoftPictureAsset {
    url: string
    secureUrl: string
    md5?: string
    format?: ESoftPictureFormat
    width?: number
    height?: number
    dpi?: number
    quality?: number
    actualWidth?: number
    actualHeight?: number
    posterUrl?: string
    posterSecureUrl?: string
}

export interface IEsoftVideoProfile {
    md5: string
    profile: string
    secureUrl: string
    url: string
}

export interface IEsoftVideo {
    batchId: number
    correctedAsset: boolean
    id: number
    orderType: string
    rootOrderLineId: number
    orderLineId: number
    updatedDate: string
    listOrder: number
    description: string
    tags: Array<string>
    name: string
    referenceType: ESoftReferenceType
    assets: Array<IEsoftPictureAsset>
    duration?: number
    productSuffix: string
    length?: string
    profiles: Array<IEsoftVideoProfile>
}

export interface ICreateEditMaterialOrderLine {
    type: ESoftProductTypes
    materials: Array<IMaterialHttpFile>
    quantity?: number
}
