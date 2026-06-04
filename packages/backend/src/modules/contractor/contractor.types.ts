import type { Contractor, } from '@prisma/client'
import type { ContractorResponseDto, } from './dto/contractor-response.dto'

export interface IContractor extends Contractor {
    location: {
        latitude: number
        longitude: number
    } | null
}

export interface IContractorListReturn {
    contractors: Array<ContractorResponseDto>
    maxPage: number
}

export interface IContractorCalendarListReturn {
    contractors: Array<Contractor>
    maxPage: number
}

export interface IContractorAvailableFilter {
    mark?: Array<number>
    archived?: Array<boolean>
}

export interface IBasicContractor {
    id: string;
    email: string;
}

export interface IContractorStatistics {
    contractorId: string
    photoSLA?: number
    sketchSLA?: number
    contentSLA?: number
    floorplanSLA?: number
    earning?: number
    avgComplRate?: number
    avgPhotoCapture?: number
    avgJobPerWeek?: number
    totalJobsDone?: number
    howOftenOnTime?: number
}

export interface IContractorRegion {
    contractorId: string;
    regionId: string;
    isHome: boolean;
}

export interface IUpdateContractorRegions {
    userId: string;
    contractorRegion: IContractorRegion | null;
    index: number;
    regionId: string;
}