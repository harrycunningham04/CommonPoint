/* eslint-disable max-len */

export const getEnumKeyByValue = (enumObj: Record<string, string>, value: string,): string | undefined => {
	return Object.keys(enumObj,).find((key,) => {
		return enumObj[key] === value
	},)
}

export interface ISkill {
  id: string;
  name: string;
  icon: string;
}

export interface IProductTypeSkill {
  skillId: string;
  productTypeId: string;
  skill: ISkill;
}

export interface IProductVariant {
  skills: Array<string>;
  id: string;
  name: string;
  requiresOnSiteContractor: boolean;
  descriptionContractor?: string;
  descriptionClient?: string;
  price: number;
  duration: number;
  packageId?:string;
  durationSettings: Array<VIDEO_DURATION | string>;
  preferences: Array<BOOKING_PREFERENCE | string>;
  productTypeSkills?: Array<IProductTypeSkill>;

  dateTime?: string;
  contractorId?: string;

  timeToCurrentLocation?: number;
  timeToNextLocation?: number;
}

export enum VIDEO_DURATION {
  SEC_45 = '45 sec',
  SEC_120 = '120 sec',
  AGENT_INTRO = 'Agent intro',
  VOICE_OVER = 'Voice over',
}

export enum PHOTO_PREFERENCE {
  ELEVATE_EXTERNAL = 'Elevate External',
  X2_PORTRAIT = '2x Portrait Photos',
  WIDE_ANGLE = 'Wide-Angle Shots (12mm)',
  X2_DETAIL = '2x Detail Shots',
  BLUR_PERSONAL_PHOTOS = 'Blur Personal Photos',
}

export const PhotoPreferenceToInfoMap: Record<PHOTO_PREFERENCE, string> = {
	[PHOTO_PREFERENCE.ELEVATE_EXTERNAL]:     'Captures the property from a higher angle to avoid obstructions like parked cars, showcasing the building in its entirety and the surrounding area for a more impressive view.',
	[PHOTO_PREFERENCE.X2_PORTRAIT]:          'Shooting in portrait orientation to better fit the format of mobile screens, optimising the content for viewers on smartphones and enhancing the visual experience on social media and property listing apps.',
	[PHOTO_PREFERENCE.WIDE_ANGLE]:           'Utilising a 12mm wide-angle lens to capture more of the room\'s details and give a sense of spaciousness, ideal for smaller rooms to make them appear larger our standared is 16mm',
	[PHOTO_PREFERENCE.X2_DETAIL]:            'Focusing on unique details of the property, such as architectural features, high-quality materials, or bespoke fittings, to highlight the luxury or unique selling points of the property.',
	[PHOTO_PREFERENCE.BLUR_PERSONAL_PHOTOS]:  'Blur personal photos and identifiable items within the property photos, ensuring privacy and focusing viewers\' attention on the property\'s features rather than personal belongings.',
}

export enum VIDEO_PREFERENCE {
  SLOW = 'Slow',
  FAST = 'Fast',
  PROPERTY_ADDRESS_INFO = 'Property Address Intro',
  BLUR_PERSONAL_PHOTOS = 'Blur Personal Photos',
}

export const VideoPreferenceToInfoMap: Record<VIDEO_PREFERENCE, string> = {
	[VIDEO_PREFERENCE.SLOW]:                  '',
	[VIDEO_PREFERENCE.FAST]:                  '',
	[VIDEO_PREFERENCE.PROPERTY_ADDRESS_INFO]: 'Include an elegant display of the property\'s address at the beginning of every video, providing a professional introduction and reinforcing the property\'s identity.',
	[VIDEO_PREFERENCE.BLUR_PERSONAL_PHOTOS]:  'Implement a subtle blur effect on personal items or photos during video tours, maintaining the property\'s appeal while respecting the privacy of current occupants.',
}

export enum FLOORPLAN_PREFERENCE {
  COLOURED = 'Coloured Floorplans',
  BLACK_AND_WHITE = 'Black and white',
  ENHANCED_ACCESSIBILITY = 'Enhanced Accessibility Features',
}

export const FloorplanPreferenceToInfoMap: Record<FLOORPLAN_PREFERENCE, string> = {
	[FLOORPLAN_PREFERENCE.COLOURED]:               'Uses different colours to distinguish between room types (e.g., living areas, bathrooms, outdoor spaces), improving readability and helping viewers to quickly understand the layout.',
	[FLOORPLAN_PREFERENCE.BLACK_AND_WHITE]:        'A black and white floorplan template option that emphasises clarity and detail, allowing for easy interpretation and a professional presentation that fits any marketing material.',
	[FLOORPLAN_PREFERENCE.ENHANCED_ACCESSIBILITY]: 'Highlight accessible features such as wider doorways, ramps, and no-step entries on floorplans for properties that accommodate or specialise in accessibility, appealing to a broader audience.',
}

export enum EDITING_PREFERENCE {
  STANDARD = 'Standard',
  MAGAZINE = 'Magazine',
  DEXTERS = 'Dexters',
  BLUE_SKIES = 'Blue Skies Editing',
}

export const EditingPreferenceToInfoMap: Record<EDITING_PREFERENCE, string> = {
	[EDITING_PREFERENCE.STANDARD]:   'Provides a clean, realistic representation of the property, with balanced colours and lighting that accurately reflects how the property looks in person.',
	[EDITING_PREFERENCE.MAGAZINE]:   'Emphasises natural light and soft tones, presenting the property in a light that is true to life, ideal for creating a warm, inviting atmosphere.',
	[EDITING_PREFERENCE.DEXTERS]:    'Brand specific.',
	[EDITING_PREFERENCE.BLUE_SKIES]: 'Ensures outdoor shots always have bright, blue skies, giving a more attractive and consistent look to property listings, even if the original photos were taken on overcast days.',
}

export enum PropertyType {
  DETACHED_HOUSE = 'DETACHED_HOUSE',
  BUNGALOW = 'BUNGALOW',
  FLAT_APARTMENT = 'FLAT_APARTMENT',
  SEMI_DETACHED_HOUSE = 'SEMI_DETACHED_HOUSE',
  TERRACED_HOUSE = 'TERRACED_HOUSE',
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

export enum BedroomsNumber {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN_PLUS = '7+',
}

export const PropertyTypeToNameMap: Record<PropertyType, string> = {
	[PropertyType.DETACHED_HOUSE]:        'Detached House',
	[PropertyType.BUNGALOW]:            'Bungalow',
	[PropertyType.FLAT_APARTMENT]:      'Flat Apartment',
	[PropertyType.SEMI_DETACHED_HOUSE]:    'Semi-Detached House',
	[PropertyType.TERRACED_HOUSE]:      'Terraced House',
}

export const NameToPropertyType: Record<string, PropertyType> = {
	'Detached House':      PropertyType.DETACHED_HOUSE,
	Bungalow:              PropertyType.BUNGALOW,
	'Flat Apartment':      PropertyType.FLAT_APARTMENT,
	'Semi-Detached House':     PropertyType.SEMI_DETACHED_HOUSE,
	'Terraced House':      PropertyType.TERRACED_HOUSE,
}

export enum PropertyAccessType {
  APPOINTMENT = 'APPOINTMENT',
  KEYS = 'KEYS',
}

export const PropertyAccessTypeToNameMap: Record<PropertyAccessType, string> = {
	[PropertyAccessType.APPOINTMENT]: 'Appointment',
	[PropertyAccessType.KEYS]:        'Keys',
}

export const NameToPropertyAccessType: Record<string, PropertyAccessType> = {
	Appointment:  PropertyAccessType.APPOINTMENT,
	Keys:        PropertyAccessType.KEYS,
}
