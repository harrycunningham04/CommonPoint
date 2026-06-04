/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { BookingDuration, BookingPreference, } from '@prisma/client'
import { VIDEO_DURATION, } from 'src/shared/types/product.types'

export enum PHOTO_PREFERENCE {
    ELEVATE_EXTERNAL = 'Elevate External',
    X2_PORTRAIT = '2x Portrait Photos',
    WIDE_ANGLE = 'Wide-Angle Shots (12mm)',
    X2_DETAIL = '2x Detail Shots',
    BLUR_PERSONAL_PHOTOS = 'Blur Personal Photos',
  }
export enum VIDEO_PREFERENCE {
    SLOW = 'Slow',
    FAST = 'Fast',
    PROPERTY_ADDRESS_INFO = 'Property Address Intro',
    BLUR_PERSONAL_PHOTOS = 'Blur Personal Photos',
  }
export enum FLOORPLAN_PREFERENCE {
    COLOURED = 'Coloured Floorplans',
    BLACK_AND_WHITE = 'Black and white',
    ENHANCED_ACCESSIBILITY = 'Enhanced Accessibility Features',
  }

export enum BOOKING_PREFERENCE {
    // vIDEO_PREFERENCE
    SLOW = VIDEO_PREFERENCE.SLOW,
    FAST = VIDEO_PREFERENCE.FAST,
    PROPERTY_ADDRESS_INFO = VIDEO_PREFERENCE.PROPERTY_ADDRESS_INFO,
    BLUR_PERSONAL_PHOTOS = VIDEO_PREFERENCE.BLUR_PERSONAL_PHOTOS,

    // fLOORPLAN_PREFERENCE
    COLOURED = FLOORPLAN_PREFERENCE.COLOURED,
    BLACK_AND_WHITE = FLOORPLAN_PREFERENCE.BLACK_AND_WHITE,
    ENHANCED_ACCESSIBILITY = FLOORPLAN_PREFERENCE.ENHANCED_ACCESSIBILITY,

    // pHOTO_PREFERENCE
    ELEVATE_EXTERNAL = PHOTO_PREFERENCE.ELEVATE_EXTERNAL,
    X2_PORTRAIT = PHOTO_PREFERENCE.X2_PORTRAIT,
    WIDE_ANGLE = PHOTO_PREFERENCE.WIDE_ANGLE,
    X2_DETAIL = PHOTO_PREFERENCE.X2_DETAIL,
  }

export const transformPreference = (preference: BOOKING_PREFERENCE,): BookingPreference | null => {
	const preferenceMap: Record<BOOKING_PREFERENCE, BookingPreference> = {
		[BOOKING_PREFERENCE.SLOW]:                  BookingPreference.SLOW,
		[BOOKING_PREFERENCE.FAST]:                  BookingPreference.FAST,
		[BOOKING_PREFERENCE.PROPERTY_ADDRESS_INFO]: BookingPreference.PROPERTY_ADDRESS_INFO,
		[BOOKING_PREFERENCE.BLUR_PERSONAL_PHOTOS]:  BookingPreference.BLUR_PERSONAL_PHOTOS,

		[BOOKING_PREFERENCE.COLOURED]:               BookingPreference.COLOURED,
		[BOOKING_PREFERENCE.BLACK_AND_WHITE]:        BookingPreference.BLACK_AND_WHITE,
		[BOOKING_PREFERENCE.ENHANCED_ACCESSIBILITY]: BookingPreference.ENHANCED_ACCESSIBILITY,

		[BOOKING_PREFERENCE.ELEVATE_EXTERNAL]: BookingPreference.ELEVATE_EXTERNAL,
		[BOOKING_PREFERENCE.X2_PORTRAIT]:      BookingPreference.X2_PORTRAIT,
		[BOOKING_PREFERENCE.WIDE_ANGLE]:       BookingPreference.WIDE_ANGLE,
		[BOOKING_PREFERENCE.X2_DETAIL]:        BookingPreference.X2_DETAIL,
	}
	return preferenceMap[preference] ?? null
}

export const transformVideoDuration = (duration: string,): BookingDuration | null => {
	const durationMap: Record<string, BookingDuration> = {
		'45 sec':      BookingDuration.SEC_45,
		'120 sec':     BookingDuration.SEC_120,
		'Agent intro': BookingDuration.AGENT_INTRO,
		'Voice over':  BookingDuration.VOICE_OVER,
	}
	return durationMap[duration] ?? null
}
