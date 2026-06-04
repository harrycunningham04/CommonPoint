import type { B2BClients, B2CClients, BookingStatus, Contractor, Office, PropertyAccessType, PropertyType, } from '@prisma/client'
import type { EClientType, } from './client.type'
import type { IProductVariant, } from './product.types'
import type { IProcessedPhoto, } from 'src/modules/booking/booking.types'

export enum EBookingStatus {
  PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
  BOOKED = 'BOOKED',
}

export enum EBookingStage {
  BOOKED = 'BOOKED',
  KEYS_COLLECTED = 'KEYS_COLLECTED',
  CONTRACTOR_ARRIVED_ON_SITE = 'CONTRACTOR_ARRIVED_ON_SITE',
  FLOORPLAN_SKETCH_UPLOADED = 'FLOORPLAN_SKETCH_UPLOADED',
  CONTRACTOR_LEFT_THE_SITE = 'CONTRACTOR_LEFT_THE_SITE',
  CONTRACTOR_LEFT_THE_KEYS = 'CONTRACTOR_LEFT_THE_KEYS',
  RAW_MATERIALS_UPLOADED = 'RAW_MATERIALS_UPLOADED',
  PHOTOS_DELIVERED = 'PHOTOS_DELIVERED',
  FLOORPLAN_IN_PROGRESS = 'FLOORPLAN_IN_PROGRESS',
  FLOORPLAN_DELIVERED = 'FLOORPLAN_DELIVERED',
  FLOORPLAN_SKETCH_DECLINED = 'FLOORPLAN_SKETCH_DECLINED',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
}

export enum EBookingType {
  BOOKING = 'BOOKING',
  ORDER = 'ORDER',
}

export enum EPropertyType {
  FLAT_APARTMENT = 'FLAT_APARTMENT',
  DETACHED_HOUSE = 'DETACHED_HOUSE',
  SEMI_DETACHED_HOUSE = 'SEMI_DETACHED_HOUSE',
  TERRACED_HOUSE = 'TERRACED_HOUSE',
  BUNGALOW = 'BUNGALOW',
  STUDIO_FLAT = 'STUDIO_FLAT',
  PENTHOUSE = 'PENTHOUSE',
  TOWNHOUSE = 'TOWNHOUSE',
  DUPLEX_TRIPLEX = 'DUPLEX_TRIPLEX',
}

export enum EMaterialTypeContent {
  PHOTOS = 'PHOTOS',
  VIDEOS = 'VIDEOS',
  VIRTUAL_STAGING = 'VIRTUAL_STAGING',
  FLOORPLANS = 'FLOORPLANS',
}

export interface IVote {
  likeCount : number
  dislikeCount:number
}

export interface IMaterial {
  id: string;
  url: string;
  name: string;
  contentType: EMaterialTypeContent;
  thumbnailUrl?: string;
  fileSize : number;

  orientation? : EMaterialOrientetion
}

export interface IMaterialWithVotes extends IMaterial {
  votes : IVote
}

export interface IBooking {
  id: string;
  bookingType: EBookingType;
  created_at: string;
  address: string;
  property_type: EPropertyType;
  number_of_bedrooms: string;
  square_footage: string;
  key_instruction: string;
  key_location_address: string;
  date_time: string;
  archived: boolean;

  total_sum: string;
  duration?: string;

  booking_status: EBookingStatus;
  booking_stage: Array<EBookingStage>;
  contractorId: string;
  adminId: string;
  b2CClientsId?: string;
  b2BClientsId?: string;

  contractor: Contractor;

  BookingStageHistory : Array<IBookingStageHistory>;

  b2CClients?: B2CClients;
  b2BClients? : B2BClients;

  office?: Office;
}

export enum BedroomsNumber {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN_PLUS = '7+',
}

export interface IBookingFormData {
  userId?: string;
  selectedProducts: Array<IProductVariant>
  selectedProductsGroups: Array<Array<IProductVariant>>
  total: number;
  officeId?: string;
  propertyType: PropertyType;
  propertyAccessType?: PropertyAccessType;
  numberOfBedrooms: BedroomsNumber;
  squareFootage: number;
  propertyDetails?: string;
  address: string;
  placeId: string;
  trusteeName?: string;
  trusteePhone?: string;
  trusteeRelationship?: string;

  booking_status?: BookingStatus;

  isAlarm: boolean;
  alarmCode?: string;
  alarmDetails?: string;

  keysAddress?: string;
  keysPlaceId?: string;
  keysDetails?: string;
  keysDateTime?: Date;
  stripePaymentIntent?: string;

  coupon?: string;

  clientId?: string;
  clientType: EClientType;
}

export interface IContactInformation {
  name: string;
  surname: string;
  phone: string;
  email: string;
}

export interface IDraftBooking extends IBookingFormData {
  contactInformation: IContactInformation;
  groupedFiles?: Array<IProcessedPhoto>;
}

export interface IBookingStageHistory {
  id : string
  bookingId : string;
  stage : EBookingStage;
  timestamp : string
}

export interface IFilteredBooking {
  filterContractors: Array<{
    fullName: string;
    id: string;
  }>;
  filterAdress: Array<string>;
  filterClients: Array<{
    fullName: string;
    id: string;
  }>;
  filterDates: Array<string>;
}

export interface IFilteredOrder {
  filterContractors: Array<{
    fullName: string;
    id: string;
  }>;

  filterClients: Array<{
    fullName: string;
    id: string;
  }>;

  filterDates: Array<string>;
}

export interface IBookingLocation extends IBooking {
  left: number;
  top: number | 'initial';
  contractorId: string;
  width: number;
  dayOffset: number;
}

export type IOrder = Omit<
  IBooking,
  'key_instruction' | 'key_location_address' | 'duration' | 'address' | 'office'
>
;export interface IOrderList {
  bookings: Array<IOrder>;
  totalCount: number;
}

export const BOOKING_STAGES = [
	{ label: 'Booked', value: EBookingStage.BOOKED, },
	{ label: 'Keys Collected', value: EBookingStage.KEYS_COLLECTED, },
	{
		label: 'Contractor Arrived On Site',
		value: EBookingStage.CONTRACTOR_ARRIVED_ON_SITE,
	},
	{
		label: 'Floorplan Sketch Declined',
		value: EBookingStage.FLOORPLAN_SKETCH_DECLINED,
	},
	{
		label: 'Floorplan Sketch Uploaded',
		value: EBookingStage.FLOORPLAN_SKETCH_UPLOADED,
	},
	{
		label: 'Contractor Left The Site',
		value: EBookingStage.CONTRACTOR_LEFT_THE_SITE,
	},
	{
		label: 'Contractor Left The Keys',
		value: EBookingStage.CONTRACTOR_LEFT_THE_KEYS,
	},
	{ label: 'Raw Photos Uploaded', value: EBookingStage.RAW_MATERIALS_UPLOADED, },
	{ label: 'Photos Delivered', value: EBookingStage.PHOTOS_DELIVERED, },
	{
		label: 'Floorplan In Progress',
		value: EBookingStage.FLOORPLAN_IN_PROGRESS,
	},
	{ label: 'Floorplan Delivered', value: EBookingStage.FLOORPLAN_DELIVERED, },
	{ label: 'Done', value: EBookingStage.DONE, },
	{ label: 'Canceled', value: EBookingStage.CANCELED, },
]

export const BOOKING_STATUS = [
	{ label: 'In Progress', value: EBookingStatus.PROGRESS, },
	{ label: 'Canceled', value: EBookingStatus.CANCELED, },
	{ label: 'Booked', value: EBookingStatus.BOOKED, },
	{ label: 'Done', value: EBookingStatus.DONE, },
]

export const BOOKING_MATERIAL = [
	{label: 'Photo', value: EMaterialTypeContent.PHOTOS,},
	{label: 'Floorplan', value: EMaterialTypeContent.FLOORPLANS,},
	{label: 'Virtual staging', value: EMaterialTypeContent.VIRTUAL_STAGING,},
	{label: 'Video', value: EMaterialTypeContent.VIDEOS,},

]
export const PROPERTY_MAP = Object.values(EPropertyType,).map((type,) => {
	return {
		value: type,
		label: type
			.split('_',)
			.map((word,) => {
				return word.charAt(0,).toUpperCase() + word.slice(1,).toLowerCase()
			},)
			.join(' ',),
	}
},)

export interface IBookingUpdate {
  property_type? : EPropertyType
  number_of_bedrooms? : string
  square_footage? : string

  booking_status? : EBookingStatus
}

export enum EMaterialOrientetion {
  LANDSCAPE = 'Landscape',
  PORTRAIT = 'Portrait',
  NONE = 'None'
}