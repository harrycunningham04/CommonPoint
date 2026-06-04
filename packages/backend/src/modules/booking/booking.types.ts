import type { Booking, ContractorTransportation, RoomType, } from '@prisma/client'
import type { Express, } from 'express'

export enum PropertyType {
    FLAT_APARTMENT = 'FLAT_APARTMENT',
    DETACHED_HOUSE = 'DETACHED_HOUSE',
    SEMI_DETACHED_HOUSE = 'SEMI_DETACHED_HOUSE',
    TERRACED_HOUSE = 'TERRACED_HOUSE',
    BUNGALOW = 'BUNGALOW',
    STUDIO_FLAT = 'STUDIO_FLAT',
    PENTHOUSE = 'PENTHOUSE',
    TOWNHOUSE = 'TOWNHOUSE',
    DUPLEX_TRIPLEX = 'DUPLEX_TRIPLEX'
  }

export enum BookingDetailType {
  APPOINTMENT = 'APPOINTMENT',
  KEYS = 'KEYS',
}

export enum BookingStatus {
    BOOKED = 'BOOKED',
    CANCELED = 'CANCELED',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
  }

export enum MaterialTypeContent {
    PHOTOS = 'PHOTOS',
    VIDEOS = 'VIDEOS',
    SKETCHES = 'SKETCHES',
    FLOORPLANS = 'FLOORPLANS',
    REFERENCES = 'REFERENCES'
  }

export type VoteTable = 'rawMaterialVote' | 'editedMaterialVote'
;export enum EMaterialType {
    RAW = 'RAW',
    EDITED = 'EDITED'
  }

export interface IProcessedPhoto {
    mainPhoto: string;
    description: string;
    roomType: RoomType;
    file?: Express.Multer.File;
    exapmlePhotos?: Array<Express.Multer.File> | Array<string>;
  }

export interface IProductTypeBooking {
    productType: {
      id: string,
      name: string,
      duration: number,
      productTypeSkills: Array<{
          skill: {
            id: string,
            name: string,
            icon: string,
          },
      }>,
    },
}

export interface IBasicLocation {
  latitude: number,
  longitude: number,
}

export interface IBookingInSlot {
  id: string,
  date_time: string,
  durationInMinutes: number | null,
  location: IBasicLocation | null,
}

export interface IContractorBookedAndAvailableSlotsSlot {
  from: Date,
  to: Date,
  durationInMinutes: number,
  isAvailable: boolean,
  isBooked: boolean,
  booking?: IBookingInSlot
}

export interface IContractorBookedAndAvailableSlotsSlotWithWay extends IContractorBookedAndAvailableSlotsSlot {
  previousLocation: IBasicLocation,
  nextLocation: IBasicLocation | null,
}

export interface IContractorBookedAndAvailableSlotsSlotWithWayAndTime extends IContractorBookedAndAvailableSlotsSlotWithWay {
  timeFromPreviousLocation: number,
  timeToNextLocation: number | null,
}
export interface IContractorBookedAndAvailableSlotsDay<T extends IContractorBookedAndAvailableSlotsSlot> {
  contractorId: string,
  dateTime: Date,
  formattedDate: string,
  isThisDayStartFromAvailableSlotOrPrevSlotAreNotBooked: boolean,
  slots: Array<T>,
}

export interface IContractorSlotRes {
  contractorIds: Array<string>,
  startTime: Date,
  endTime: Date,
  timeToCurrentLocation: number,
  timeToNextLocation: number | null,
}

export type MapContractorSlotsRes = Map<string, Array<IContractorSlotRes>>
export type ContractorSlotsResArray = Record<string, Array<IContractorSlotRes>>

export type ContractorBookedAndAvailableSlotsDay = IContractorBookedAndAvailableSlotsDay<IContractorBookedAndAvailableSlotsSlot>
export type ContractorBookedAndAvailableSlotsDayWithWay = IContractorBookedAndAvailableSlotsDay<IContractorBookedAndAvailableSlotsSlotWithWay>
export type ContractorBookedAndAvailableSlotsDayWithWayAndTime = IContractorBookedAndAvailableSlotsDay<IContractorBookedAndAvailableSlotsSlotWithWayAndTime>

export interface IContractorBookedAndAvailableSlots<T extends IContractorBookedAndAvailableSlotsSlot> {
  days: Array<IContractorBookedAndAvailableSlotsDay<T>>,
}

export type ContractorBookedAndAvailableSlots = IContractorBookedAndAvailableSlots<IContractorBookedAndAvailableSlotsSlot>

export type ContractorBookedAndAvailableSlotsWithWay = IContractorBookedAndAvailableSlots<IContractorBookedAndAvailableSlotsSlotWithWay>

export type MapContractorBookedAndAvailableSlots = Map<string, ContractorBookedAndAvailableSlots>
export type MapContractorBookedAndAvailableSlotsWithWay = Map<string, ContractorBookedAndAvailableSlotsWithWay>
export type MapContractorBookedAndAvailableSlotsDayWithWayAndTime  = Map<string, Array<ContractorBookedAndAvailableSlotsDayWithWayAndTime>>

export enum EContractorChangeStatus {
  KEYS_COLLECTED = 'KEYS_COLLECTED',
  ARRIVED_ON_SITE = 'ARRIVED_ON_SITE',
  LEFT_THE_SITE = 'LEFT_THE_SITE',
  KEYS_RETURNED = 'KEYS_RETURNED',
}

export enum EFloorplanChecklist {
  ELEMENT_1 = 'ELEMENT_1',
  ELEMENT_2 = 'ELEMENT_2',
  ELEMENT_3 = 'ELEMENT_3',
  ELEMENT_4 = 'ELEMENT_4',
}

export type BookingWithLocation = Booking & {
	contractor: {
		transportation: ContractorTransportation,
		ContractorLocation: { latitude: number, longitude: number } | null,
	} | null,
	location: { latitude: number, longitude: number } | null,
	keyLocation: { latitude: number, longitude: number } | null,
}