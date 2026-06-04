/* eslint-disable max-lines */
import type { ContractorDispute, Report,} from '@prisma/client'
import { ReportType, } from '@prisma/client'

export type GenericVariants<T extends string> = {
  [key in T]: {
    key: T,
    contractorName: string,
    clientName: string,
    reportType: Array<ReportType>,
  }
}

export enum LocationVariantsEnum {
  WHOLE_PROPERTY = 'WHOLE_PROPERTY',
  FRONT_EXTERNAL = 'FRONT_EXTERNAL',
  BEDROOM = 'BEDROOM',
  RECEPTION_ROOM = 'RECEPTION_ROOM',
  MULTIPLE_BEDROOMS = 'MULTIPLE_BEDROOMS',
  KITCHEN = 'KITCHEN',
  GARDEN = 'GARDEN',
  BATHROOM = 'BATHROOM',
  GROUND_FLOOR = 'GROUND_FLOOR',
  VIEW_SHOTS = 'VIEW_SHOTS',
  ENSUITE = 'ENSUITE',
  COMMUNAL_SPACE = 'COMMUNAL_SPACE',
  POOL_GYM = 'POOL_GYM',
  FIRST_FLOOR = 'FIRST_FLOOR',
  SECOND_FLOOR = 'SECOND_FLOOR',
  THIRD_FLOOR = 'THIRD_FLOOR',
  TOP_FLOOR = 'TOP_FLOOR',
  LOWER_GROUND_FLOOR = 'LOWER_GROUND_FLOOR',

  OUTSIDE_SPACE = 'OUTSIDE_SPACE',
  EAVES = 'EAVES',
  CELLAR = 'CELLAR',
  VAULTS = 'VAULTS',
  LOFT_MEASUREMENTS = 'LOFT_MEASUREMENTS',
  GARAGE = 'GARAGE',
  PARKING = 'PARKING',

  STAIRCASE = 'STAIRCASE',
  BALCONY = 'BALCONY',
  HALLWAY = 'HALLWAY',

  REAR_EXTERNAL = 'REAR_EXTERNAL',
  ROOF = 'ROOF',
  DRIVEWAY_PARKING = 'DRIVEWAY_PARKING',
  BALCONY_TERRACE = 'BALCONY_TERRACE',
  SURROUNDING_AREA = 'SURROUNDING_AREA',
  COASTAL_WATERFRONT = 'COASTAL_WATERFRONT',
  RURAL_LANDSCAPE = 'RURAL_LANDSCAPE',

  WINDOWS_DOORS = 'WINDOWS_DOORS',
  HEATING_SYSTEM = 'HEATING_SYSTEM',
  HOT_WATER_CYLINDER = 'HOT_WATER_CYLINDER',
  LOFT_SPACE = 'LOFT_SPACE',
  WALLS_STRUCTURE = 'WALLS_STRUCTURE',
  METER_UTILITY_READINGS = 'METER_UTILITY_READINGS',
}

export const LocationVariants: GenericVariants<LocationVariantsEnum> = {
	[LocationVariantsEnum.WHOLE_PROPERTY]: {
		key:            LocationVariantsEnum.WHOLE_PROPERTY,
		contractorName: 'Whole Property',
		clientName:     'whole property',
		reportType:     [ReportType.photo, ReportType.floorplan, ReportType.video, ReportType.drone, ReportType.epc,],
	},

	[LocationVariantsEnum.FRONT_EXTERNAL]: {
		key:            LocationVariantsEnum.FRONT_EXTERNAL,
		contractorName: 'Front External',
		clientName:     'front external',
		reportType:     [ReportType.photo, ReportType.video, ReportType.drone, ReportType.epc,],
	},
	[LocationVariantsEnum.BEDROOM]: {
		key:            LocationVariantsEnum.BEDROOM,
		contractorName: 'Bedroom',
		clientName:     'bedroom',
		reportType:     [ReportType.photo, ReportType.floorplan, ReportType.video,],
	},
	[LocationVariantsEnum.RECEPTION_ROOM]: {
		key:            LocationVariantsEnum.RECEPTION_ROOM,
		contractorName: 'Reception Room',
		clientName:     'reception room',
		reportType:     [ReportType.photo, ReportType.floorplan, ReportType.video,],
	},
	[LocationVariantsEnum.MULTIPLE_BEDROOMS]: {
		key:            LocationVariantsEnum.MULTIPLE_BEDROOMS,
		contractorName: 'Multiple Bedrooms',
		clientName:     'multiple bedrooms',
		reportType:     [ReportType.photo, ReportType.floorplan, ReportType.video,],
	},
	[LocationVariantsEnum.KITCHEN]: {
		key:            LocationVariantsEnum.KITCHEN,
		contractorName: 'Kitchen',
		clientName:     'kitchen',
		reportType:     [ReportType.photo, ReportType.floorplan, ReportType.video,],
	},
	[LocationVariantsEnum.GARDEN]: {
		key:            LocationVariantsEnum.GARDEN,
		contractorName: 'Garden',
		clientName:     'garden',
		reportType:     [ReportType.photo, ReportType.video, ReportType.drone,],
	},
	[LocationVariantsEnum.BATHROOM]: {
		key:            LocationVariantsEnum.BATHROOM,
		contractorName: 'Bathroom',
		clientName:     'bathroom',
		reportType:     [ReportType.photo, ReportType.floorplan,],
	},
	[LocationVariantsEnum.GROUND_FLOOR]: {
		key:            LocationVariantsEnum.GROUND_FLOOR,
		contractorName: 'Ground Floor',
		clientName:     'ground floor',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.VIEW_SHOTS]: {
		key:            LocationVariantsEnum.VIEW_SHOTS,
		contractorName: 'View Shots',
		clientName:     'view shots',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.ENSUITE]: {
		key:            LocationVariantsEnum.ENSUITE,
		contractorName: 'Ensuite',
		clientName:     'ensuite',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.COMMUNAL_SPACE]: {
		key:            LocationVariantsEnum.COMMUNAL_SPACE,
		contractorName: 'Communal Space',
		clientName:     'communal space',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.POOL_GYM]: {
		key:            LocationVariantsEnum.POOL_GYM,
		contractorName: 'Pool/Gym',
		clientName:     'pool/gym',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.FIRST_FLOOR]: {
		key:            LocationVariantsEnum.FIRST_FLOOR,
		contractorName: '1st Floor',
		clientName:     '1st floor',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.SECOND_FLOOR]: {
		key:            LocationVariantsEnum.SECOND_FLOOR,
		contractorName: '2nd Floor',
		clientName:     '2nd floor',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.THIRD_FLOOR]: {
		key:            LocationVariantsEnum.THIRD_FLOOR,
		contractorName: '3rd Floor',
		clientName:     '3rd floor',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.TOP_FLOOR]: {
		key:            LocationVariantsEnum.TOP_FLOOR,
		contractorName: 'Top Floor',
		clientName:     'top floor',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.LOWER_GROUND_FLOOR]: {
		key:            LocationVariantsEnum.LOWER_GROUND_FLOOR,
		contractorName: 'Lower Ground Floor',
		clientName:     'lower ground floor',
		reportType:     [ReportType.photo,],
	},
	[LocationVariantsEnum.OUTSIDE_SPACE]: {
		key:            LocationVariantsEnum.OUTSIDE_SPACE,
		contractorName: 'Outside Space',
		clientName:     'demised outside space',
		reportType:     [ReportType.floorplan,],
	},
	[LocationVariantsEnum.EAVES]: {
		key:            LocationVariantsEnum.EAVES,
		contractorName: 'Eaves',
		clientName:     'eaves storage',
		reportType:     [ReportType.floorplan,],
	},
	[LocationVariantsEnum.CELLAR]: {
		key:            LocationVariantsEnum.CELLAR,
		contractorName: 'Cellar',
		clientName:     'cellar',
		reportType:     [ReportType.floorplan,],
	},
	[LocationVariantsEnum.VAULTS]: {
		key:            LocationVariantsEnum.VAULTS,
		contractorName: 'Vaults',
		clientName:     'vaults',
		reportType:     [ReportType.floorplan,],
	},
	[LocationVariantsEnum.LOFT_MEASUREMENTS]: {
		key:            LocationVariantsEnum.LOFT_MEASUREMENTS,
		contractorName: 'Loft Measurements',
		clientName:     'loft',
		reportType:     [ReportType.floorplan,],
	},
	[LocationVariantsEnum.GARAGE]: {
		key:            LocationVariantsEnum.GARAGE,
		contractorName: 'Garage',
		clientName:     'garage',
		reportType:     [ReportType.floorplan,],
	},
	[LocationVariantsEnum.PARKING]: {
		key:            LocationVariantsEnum.PARKING,
		contractorName: 'Parking',
		clientName:     'parking space',
		reportType:     [ReportType.floorplan,],
	},

	[LocationVariantsEnum.STAIRCASE]: {
		key:            LocationVariantsEnum.STAIRCASE,
		contractorName: 'Staircase',
		clientName:     'staircase',
		reportType:     [ReportType.video,],
	},
	[LocationVariantsEnum.BALCONY]: {
		key:            LocationVariantsEnum.BALCONY,
		contractorName: 'Balcony',
		clientName:     'balcony',
		reportType:     [ReportType.video,],
	},
	[LocationVariantsEnum.HALLWAY]: {
		key:            LocationVariantsEnum.HALLWAY,
		contractorName: 'Hallway',
		clientName:     'hallway',
		reportType:     [ReportType.video,],
	},
	[LocationVariantsEnum.REAR_EXTERNAL]: {
		key:            LocationVariantsEnum.REAR_EXTERNAL,
		contractorName: 'Rear External',
		clientName:     'rear external',
		reportType:     [ReportType.drone, ReportType.epc,],
	},
	[LocationVariantsEnum.ROOF]: {
		key:            LocationVariantsEnum.ROOF,
		contractorName: 'Roof',
		clientName:     'roof',
		reportType:     [ReportType.drone, ReportType.epc,],
	},
	[LocationVariantsEnum.DRIVEWAY_PARKING]: {
		key:            LocationVariantsEnum.DRIVEWAY_PARKING,
		contractorName: 'Driveway & Parking',
		clientName:     'driveway & parking',
		reportType:     [ReportType.drone,],
	},
	[LocationVariantsEnum.BALCONY_TERRACE]: {
		key:            LocationVariantsEnum.BALCONY_TERRACE,
		contractorName: 'Balcony & Terrace',
		clientName:     'balcony & terrace',
		reportType:     [ReportType.drone,],
	},
	[LocationVariantsEnum.SURROUNDING_AREA]: {
		key:            LocationVariantsEnum.SURROUNDING_AREA,
		contractorName: 'Surrounding Area',
		clientName:     'surrounding area',
		reportType:     [ReportType.drone,],
	},
	[LocationVariantsEnum.COASTAL_WATERFRONT]: {
		key:            LocationVariantsEnum.COASTAL_WATERFRONT,
		contractorName: 'Coastal/Waterfront',
		clientName:     'coastal/waterfront',
		reportType:     [ReportType.drone,],
	},
	[LocationVariantsEnum.RURAL_LANDSCAPE]: {
		key:            LocationVariantsEnum.RURAL_LANDSCAPE,
		contractorName: 'Rural/Landscape',
		clientName:     'rural/landscape',
		reportType:     [ReportType.drone,],
	},

	[LocationVariantsEnum.WINDOWS_DOORS]: {
		key:            LocationVariantsEnum.WINDOWS_DOORS,
		contractorName: 'Windows & Doors',
		clientName:     'windows & doors',
		reportType:     [ReportType.epc,],
	},
	[LocationVariantsEnum.HEATING_SYSTEM]: {
		key:            LocationVariantsEnum.HEATING_SYSTEM,
		contractorName: 'Heating System',
		clientName:     'heating system',
		reportType:     [ReportType.epc,],
	},
	[LocationVariantsEnum.HOT_WATER_CYLINDER]: {
		key:            LocationVariantsEnum.HOT_WATER_CYLINDER,
		contractorName: 'Hot Water Cylinder',
		clientName:     'hot water cylinder',
		reportType:     [ReportType.epc,],
	},
	[LocationVariantsEnum.LOFT_SPACE]: {
		key:            LocationVariantsEnum.LOFT_SPACE,
		contractorName: 'Loft Space',
		clientName:     'loft space',
		reportType:     [ReportType.epc,],
	},
	[LocationVariantsEnum.WALLS_STRUCTURE]: {
		key:            LocationVariantsEnum.WALLS_STRUCTURE,
		contractorName: 'Walls & Structure',
		clientName:     'walls & structure',
		reportType:     [ReportType.epc,],
	},
	[LocationVariantsEnum.METER_UTILITY_READINGS]: {
		key:            LocationVariantsEnum.METER_UTILITY_READINGS,
		contractorName: 'Meter & Utility Readings',
		clientName:     'meter & utilities',
		reportType:     [ReportType.epc,],
	},
}

export enum ReasonVariantsEnum {
  VERY_MESSY = 'VERY_MESSY',
  OBSTRUCTION = 'OBSTRUCTION',
  CONSTRUCTION = 'CONSTRUCTION',
  LIGHTING_NOT_WORKING = 'LIGHTING_NOT_WORKING',
  BROKEN_OBJECT = 'BROKEN_OBJECT',
  AT_THE_VENDORS_REQUEST = 'AT_THE_VENDORS_REQUEST',
  RAIN = 'RAIN',
  UNABLE_TO_GET_ACCESS = 'UNABLE_TO_GET_ACCESS',
  SUN_POSITION = 'SUN_POSITION',
  PRIVACY_REQUEST = 'PRIVACY_REQUEST',
  NOT_AWARE_WE_WERE_COMING = 'NOT_AWARE_WE_WERE_COMING',
  SAFETY_CONCERNS = 'SAFETY_CONCERNS',
  KEYS_NOT_WORKING = 'KEYS_NOT_WORKING',

  VERY_MESSY_ENVIRONMENT = 'VERY_MESSY_ENVIRONMENT',
  OBSTRUCTION_IN_VIEW = 'OBSTRUCTION_IN_VIEW',
  CONSTRUCTION_NOISE = 'CONSTRUCTION_NOISE',
  POOR_LIGHTING = 'POOR_LIGHTING',
  BROKEN_OBJECTS_VISIBLE = 'BROKEN_OBJECTS_VISIBLE',
  REFLECTIONS_CAUSING_ISSUES = 'REFLECTIONS_CAUSING_ISSUES',
  TIGHT_SPACE_DIFFICULT_TO_FILM = 'TIGHT_SPACE_DIFFICULT_TO_FILM',
  LIMITED_SPACE_FOR_SMOOTH_MOVEMENT = 'LIMITED_SPACE_FOR_SMOOTH_MOVEMENT',
  WEATHER_AFFECTING_FOOTAGE = 'WEATHER_AFFECTING_FOOTAGE',
  WIND_AFFECTING_STABILITY = 'WIND_AFFECTING_STABILITY',
  DIFFICULT_TO_FRAME_PROPERLY = 'DIFFICULT_TO_FRAME_PROPERLY',

  FLIGHT_RESTRICTIONS = 'FLIGHT_RESTRICTIONS',
  AIRSPACE_RESTRICTION = 'AIRSPACE_RESTRICTION',
  OBSTRUCTIONS = 'OBSTRUCTIONS',
  NO_FLY_ZONE = 'NO_FLY_ZONE',
  WIND_INTERFERENCE = 'WIND_INTERFERENCE',
  LIMITED_TAKE_OFF_SPACE = 'LIMITED_TAKE_OFF_SPACE',
  CLOSE_PROXIMITY_TO_OTHER_BUILDINGS = 'CLOSE_PROXIMITY_TO_OTHER_BUILDINGS',
  PRIVACY_CONCERNS = 'PRIVACY_CONCERNS',
  HIGH_WIND_SPEEDS = 'HIGH_WIND_SPEEDS',
  POOR_GPS_SIGNAL = 'POOR_GPS_SIGNAL',

  LIMITED_ACCESS_TO_AREAS = 'LIMITED_ACCESS_TO_AREAS',
  UNABLE_TO_ASSESS_INSULATION = 'UNABLE_TO_ASSESS_INSULATION',
  OBSTRUCTED_VIEW_OF_KEY_FEATURES = 'OBSTRUCTED_VIEW_OF_KEY_FEATURES',
  NO_ACCESS_TO_LOFT_OR_INSULATION = 'NO_ACCESS_TO_LOFT_OR_INSULATION',
  UNABLE_TO_VERIFY_GLAZING_TYPE = 'UNABLE_TO_VERIFY_GLAZING_TYPE',
  NO_ACCESS_TO_BOILER_OR_HEATING_CONTROLS = 'NO_ACCESS_TO_BOILER_OR_HEATING_CONTROLS',
  NO_ACCESS_TO_HOT_WATER_SYSTEM = 'NO_ACCESS_TO_HOT_WATER_SYSTEM',
  NO_SAFE_ACCESS_TO_LOFT = 'NO_SAFE_ACCESS_TO_LOFT',
  UNABLE_TO_VERIFY_CONSTRUCTION_TYPE = 'UNABLE_TO_VERIFY_CONSTRUCTION_TYPE',
  NO_ACCESS_TO_METERS = 'NO_ACCESS_TO_METERS',
}

export const ReasonVariants: GenericVariants<ReasonVariantsEnum> = {
	[ReasonVariantsEnum.VERY_MESSY]: {
		key:            ReasonVariantsEnum.VERY_MESSY,
		contractorName: 'Very Messy',
		clientName:     'it being cluttered',
		reportType:     [ReportType.photo,],
	},
	[ReasonVariantsEnum.OBSTRUCTION]: {
		key:            ReasonVariantsEnum.OBSTRUCTION,
		contractorName: 'Obstruction',
		clientName:     'an obstruction',
		reportType:     [ReportType.photo, ReportType.floorplan,],
	},
	[ReasonVariantsEnum.CONSTRUCTION]: {
		key:            ReasonVariantsEnum.CONSTRUCTION,
		contractorName: 'Construction',
		clientName:     'construction',
		reportType:     [ReportType.photo, ReportType.floorplan,],
	},
	[ReasonVariantsEnum.LIGHTING_NOT_WORKING]: {
		key:            ReasonVariantsEnum.LIGHTING_NOT_WORKING,
		contractorName: 'Lighting Not Working',
		clientName:     'the lighting not working',
		reportType:     [ReportType.photo,],
	},
	[ReasonVariantsEnum.BROKEN_OBJECT]: {
		key:            ReasonVariantsEnum.BROKEN_OBJECT,
		contractorName: 'Broken Object',
		clientName:     'a broken object',
		reportType:     [ReportType.photo,],
	},
	[ReasonVariantsEnum.AT_THE_VENDORS_REQUEST]: {
		key:            ReasonVariantsEnum.AT_THE_VENDORS_REQUEST,
		contractorName: 'At the Vendors Request',
		clientName:     'vendors specific request',
		reportType:     [ReportType.photo,],
	},
	[ReasonVariantsEnum.RAIN]: {
		key:            ReasonVariantsEnum.RAIN,
		contractorName: 'Rain',
		clientName:     'rain',
		reportType:     [ReportType.photo,],
	},
	[ReasonVariantsEnum.UNABLE_TO_GET_ACCESS]: {
		key:            ReasonVariantsEnum.UNABLE_TO_GET_ACCESS,
		contractorName: 'Unable to Get Access',
		clientName:     'not being able to get access',
		reportType:     [ReportType.photo, ReportType.floorplan,],
	},
	[ReasonVariantsEnum.SUN_POSITION]: {
		key:            ReasonVariantsEnum.SUN_POSITION,
		contractorName: 'Sun Position',
		clientName:     'the sun position',
		reportType:     [ReportType.photo,],
	},
	[ReasonVariantsEnum.PRIVACY_REQUEST]: {
		key:            ReasonVariantsEnum.PRIVACY_REQUEST,
		contractorName: 'Privacy Request',
		clientName:     'a request for privacy',
		reportType:     [ReportType.photo,],
	},
	[ReasonVariantsEnum.NOT_AWARE_WE_WERE_COMING]: {
		key:            ReasonVariantsEnum.NOT_AWARE_WE_WERE_COMING,
		contractorName: 'Not Aware We Were Coming',
		clientName:     'the person not being aware we were coming',
		reportType:     [ReportType.photo, ReportType.floorplan,],
	},
	[ReasonVariantsEnum.SAFETY_CONCERNS]: {
		key:            ReasonVariantsEnum.SAFETY_CONCERNS,
		contractorName: 'Safety concerns (add detail in notes)',
		clientName:     'safety concerns',
		reportType:     [ReportType.photo, ReportType.floorplan,],
	},
	[ReasonVariantsEnum.KEYS_NOT_WORKING]: {
		key:            ReasonVariantsEnum.KEYS_NOT_WORKING,
		contractorName: 'Keys Not Working',
		clientName:     'the keys not working',
		reportType:     [ReportType.photo, ReportType.floorplan,],
	},

	[ReasonVariantsEnum.VERY_MESSY_ENVIRONMENT]: {
		key:            ReasonVariantsEnum.VERY_MESSY_ENVIRONMENT,
		contractorName: 'Very messy environment',
		clientName:     'the property being cluttered',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.OBSTRUCTION_IN_VIEW]: {
		key:            ReasonVariantsEnum.OBSTRUCTION_IN_VIEW,
		contractorName: 'Obstruction in view',
		clientName:     'an obstruction affecting the video',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.CONSTRUCTION_NOISE]: {
		key:            ReasonVariantsEnum.CONSTRUCTION_NOISE,
		contractorName: 'Construction noise',
		clientName:     'construction noise affecting the audio',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.POOR_LIGHTING]: {
		key:            ReasonVariantsEnum.POOR_LIGHTING,
		contractorName: 'Poor lighting',
		clientName:     'poor lighting conditions',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.BROKEN_OBJECTS_VISIBLE]: {
		key:            ReasonVariantsEnum.BROKEN_OBJECTS_VISIBLE,
		contractorName: 'Broken objects visible',
		clientName:     'visible broken objects in the video',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.REFLECTIONS_CAUSING_ISSUES]: {
		key:            ReasonVariantsEnum.REFLECTIONS_CAUSING_ISSUES,
		contractorName: 'Reflections causing issues',
		clientName:     'reflections interfering with the video',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.TIGHT_SPACE_DIFFICULT_TO_FILM]: {
		key:            ReasonVariantsEnum.TIGHT_SPACE_DIFFICULT_TO_FILM,
		contractorName: 'Tight space, difficult to film',
		clientName:     'the space being difficult to capture',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.LIMITED_SPACE_FOR_SMOOTH_MOVEMENT]: {
		key:            ReasonVariantsEnum.LIMITED_SPACE_FOR_SMOOTH_MOVEMENT,
		contractorName: 'Limited space for smooth movement',
		clientName:     'the space limiting smooth video movement',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.WEATHER_AFFECTING_FOOTAGE]: {
		key:            ReasonVariantsEnum.WEATHER_AFFECTING_FOOTAGE,
		contractorName: 'Weather affecting footage',
		clientName:     'the weather impacting the footage',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.WIND_AFFECTING_STABILITY]: {
		key:            ReasonVariantsEnum.WIND_AFFECTING_STABILITY,
		contractorName: 'Wind affecting stability',
		clientName:     'wind making stabilised shots difficult',
		reportType:     [ReportType.video,],
	},
	[ReasonVariantsEnum.DIFFICULT_TO_FRAME_PROPERLY]: {
		key:            ReasonVariantsEnum.DIFFICULT_TO_FRAME_PROPERLY,
		contractorName: 'Difficult to frame properly',
		clientName:     'the space being difficult to frame',
		reportType:     [ReportType.video,],
	},

	[ReasonVariantsEnum.FLIGHT_RESTRICTIONS]: {
		key:            ReasonVariantsEnum.FLIGHT_RESTRICTIONS,
		contractorName: 'Flight restrictions',
		clientName:     'flight restrictions preventing drone use',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.AIRSPACE_RESTRICTION]: {
		key:            ReasonVariantsEnum.AIRSPACE_RESTRICTION,
		contractorName: 'Airspace restriction',
		clientName:     'airspace restrictions preventing flight',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.OBSTRUCTIONS]: {
		key:            ReasonVariantsEnum.OBSTRUCTIONS,
		contractorName: 'Obstructions (trees, power lines)',
		clientName:     'obstructions affecting drone shots',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.NO_FLY_ZONE]: {
		key:            ReasonVariantsEnum.NO_FLY_ZONE,
		contractorName: 'No-fly zone due to regulations',
		clientName:     'restrictions preventing aerial shots',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.WIND_INTERFERENCE]: {
		key:            ReasonVariantsEnum.WIND_INTERFERENCE,
		contractorName: 'Wind interference',
		clientName:     'wind conditions affecting stability',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.LIMITED_TAKE_OFF_SPACE]: {
		key:            ReasonVariantsEnum.LIMITED_TAKE_OFF_SPACE,
		contractorName: 'Limited take-off space',
		clientName:     'no safe location for drone take-off',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.CLOSE_PROXIMITY_TO_OTHER_BUILDINGS]: {
		key:            ReasonVariantsEnum.CLOSE_PROXIMITY_TO_OTHER_BUILDINGS,
		contractorName: 'Close proximity to other buildings',
		clientName:     'neighbouring buildings restricting flight space',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.PRIVACY_CONCERNS]: {
		key:            ReasonVariantsEnum.PRIVACY_CONCERNS,
		contractorName: 'Privacy concerns',
		clientName:     'privacy concerns preventing certain shots',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.HIGH_WIND_SPEEDS]: {
		key:            ReasonVariantsEnum.HIGH_WIND_SPEEDS,
		contractorName: 'High wind speeds',
		clientName:     'wind conditions affecting stability',
		reportType:     [ReportType.drone,],
	},
	[ReasonVariantsEnum.POOR_GPS_SIGNAL]: {
		key:            ReasonVariantsEnum.POOR_GPS_SIGNAL,
		contractorName: 'Poor GPS signal',
		clientName:     'weak GPS signal affecting stability',
		reportType:     [ReportType.drone,],
	},

	[ReasonVariantsEnum.LIMITED_ACCESS_TO_AREAS]: {
		key:            ReasonVariantsEnum.LIMITED_ACCESS_TO_AREAS,
		contractorName: 'Limited access to areas',
		clientName:     'access issues preventing full inspection',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.UNABLE_TO_ASSESS_INSULATION]: {
		key:            ReasonVariantsEnum.UNABLE_TO_ASSESS_INSULATION,
		contractorName: 'Unable to assess insulation',
		clientName:     'insulation type unclear or inaccessible',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.OBSTRUCTED_VIEW_OF_KEY_FEATURES]: {
		key:            ReasonVariantsEnum.OBSTRUCTED_VIEW_OF_KEY_FEATURES,
		contractorName: 'Obstructed view of key features',
		clientName:     'external factors preventing accurate assessment',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.NO_ACCESS_TO_LOFT_OR_INSULATION]: {
		key:            ReasonVariantsEnum.NO_ACCESS_TO_LOFT_OR_INSULATION,
		contractorName: 'No access to loft or insulation',
		clientName:     'unable to verify insulation or structure',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.UNABLE_TO_VERIFY_GLAZING_TYPE]: {
		key:            ReasonVariantsEnum.UNABLE_TO_VERIFY_GLAZING_TYPE,
		contractorName: 'Unable to verify glazing type',
		clientName:     'window specifications unclear or inaccessible',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.NO_ACCESS_TO_BOILER_OR_HEATING_CONTROLS]: {
		key:            ReasonVariantsEnum.NO_ACCESS_TO_BOILER_OR_HEATING_CONTROLS,
		contractorName: 'No access to boiler or heating controls',
		clientName:     'unable to assess heating efficiency',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.NO_ACCESS_TO_HOT_WATER_SYSTEM]: {
		key:            ReasonVariantsEnum.NO_ACCESS_TO_HOT_WATER_SYSTEM,
		contractorName: 'No access to hot water system',
		clientName:     'unable to verify insulation or heating type',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.NO_SAFE_ACCESS_TO_LOFT]: {
		key:            ReasonVariantsEnum.NO_SAFE_ACCESS_TO_LOFT,
		contractorName: 'No safe access to loft',
		clientName:     'unable to confirm insulation or structure',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.UNABLE_TO_VERIFY_CONSTRUCTION_TYPE]: {
		key:            ReasonVariantsEnum.UNABLE_TO_VERIFY_CONSTRUCTION_TYPE,
		contractorName: 'Unable to verify construction type',
		clientName:     'wall type unclear due to external obstructions',
		reportType:     [ReportType.epc,],
	},
	[ReasonVariantsEnum.NO_ACCESS_TO_METERS]: {
		key:            ReasonVariantsEnum.NO_ACCESS_TO_METERS,
		contractorName: 'No access to meters',
		clientName:     'unable to take readings for assessment',
		reportType:     [ReportType.epc,],
	},

}

export enum SolutionVariantsEnum {
  DID_OUR_BEST = 'DID_OUR_BEST',
  SHOT_IT_AS_IT_WAS = 'SHOT_IT_AS_IT_WAS',
  FOCUSED_ON_OTHER_AREAS_INSTEAD = 'FOCUSED_ON_OTHER_AREAS_INSTEAD',
  CAPTURED_ONE_ANGLE = 'CAPTURED_ONE_ANGLE',
  BOOK_A_REVISIT = 'BOOK_A_REVISIT',

  MADE_AN_ASSUMPTION = 'MADE_AN_ASSUMPTION',

  ADJUSTED_ANGLES = 'ADJUSTED_ANGLES',
  USED_A_WIDER_LENS_WHERE_POSSIBLE = 'USED_A_WIDER_LENS_WHERE_POSSIBLE',
  USED_STABILISATION_TECHNIQUES = 'USED_STABILISATION_TECHNIQUES',
  ADJUSTED_CAMERA_SETTINGS = 'ADJUSTED_CAMERA_SETTINGS',

  USED_ALTERNATIVE_EXTERNAL_ANGLES = 'USED_ALTERNATIVE_EXTERNAL_ANGLES',
  CAPTURED_FROM_LEGALLY_PERMITTED_AREAS = 'CAPTURED_FROM_LEGALLY_PERMITTED_AREAS',
  ADJUSTED_FLIGHT_PATH_TO_AVOID_OBSTRUCTIONS = 'ADJUSTED_FLIGHT_PATH_TO_AVOID_OBSTRUCTIONS',

  REQUESTED_FURTHER_INFORMATION_FROM_THE_CLIENT = 'REQUESTED_FURTHER_INFORMATION_FROM_THE_CLIENT',

	CANCELLATION = 'CANCELLATION',
}

export const SolutionVariants: GenericVariants<SolutionVariantsEnum> = {
	[SolutionVariantsEnum.DID_OUR_BEST]: {
		key:            SolutionVariantsEnum.DID_OUR_BEST,
		contractorName: 'Did our best',
		clientName:     'have done our best',
		reportType:     [ReportType.photo,],
	},
	[SolutionVariantsEnum.SHOT_IT_AS_IT_WAS]: {
		key:            SolutionVariantsEnum.SHOT_IT_AS_IT_WAS,
		contractorName: 'Shot it as it was',
		clientName:     'have shot it as it was',
		reportType:     [ReportType.photo,],
	},
	[SolutionVariantsEnum.FOCUSED_ON_OTHER_AREAS_INSTEAD]: {
		key:            SolutionVariantsEnum.FOCUSED_ON_OTHER_AREAS_INSTEAD,
		contractorName: 'Focused on other areas instead',
		clientName:     'have focused on other parts of the property instead',
		reportType:     [ReportType.photo,],
	},
	[SolutionVariantsEnum.CAPTURED_ONE_ANGLE]: {
		key:            SolutionVariantsEnum.CAPTURED_ONE_ANGLE,
		contractorName: 'Captured one angle',
		clientName:     'have captured one angle only',
		reportType:     [ReportType.photo,],
	},
	[SolutionVariantsEnum.BOOK_A_REVISIT]: {
		key:            SolutionVariantsEnum.BOOK_A_REVISIT,
		contractorName: 'Book a revisit (suggest when in notes)',
		clientName:     'will reach out to book a revisit',
		reportType:     [ReportType.photo, ReportType.floorplan, ReportType.video, ReportType.drone, ReportType.epc,],
	},

	[SolutionVariantsEnum.MADE_AN_ASSUMPTION]: {
		key:            SolutionVariantsEnum.MADE_AN_ASSUMPTION,
		contractorName: 'Made an assumption',
		clientName:     'have had to make an assumption',
		reportType:     [ReportType.photo, ReportType.floorplan,],
	},

	[SolutionVariantsEnum.ADJUSTED_ANGLES]: {
		key:            SolutionVariantsEnum.ADJUSTED_ANGLES,
		contractorName: 'Adjusted angles',
		clientName:     'have adjusted angles',
		reportType:     [ReportType.video,],
	},
	[SolutionVariantsEnum.USED_A_WIDER_LENS_WHERE_POSSIBLE]: {
		key:            SolutionVariantsEnum.USED_A_WIDER_LENS_WHERE_POSSIBLE,
		contractorName: 'Used a wider lens where possible',
		clientName:     'have used the best possible angles to capture the space',
		reportType:     [ReportType.video,],
	},

	[SolutionVariantsEnum.USED_STABILISATION_TECHNIQUES]: {
		key:            SolutionVariantsEnum.USED_STABILISATION_TECHNIQUES,
		contractorName: 'Used stabilisation techniques',
		clientName:     'have ensured smooth shots with stabilised equipment',
		reportType:     [ReportType.video,],
	},

	[SolutionVariantsEnum.ADJUSTED_CAMERA_SETTINGS]: {
		key:            SolutionVariantsEnum.ADJUSTED_CAMERA_SETTINGS,
		contractorName: 'Adjusted camera settings',
		clientName:     'have adapted settings',
		reportType:     [ReportType.video,],
	},

	[SolutionVariantsEnum.USED_ALTERNATIVE_EXTERNAL_ANGLES]: {
		key:            SolutionVariantsEnum.USED_ALTERNATIVE_EXTERNAL_ANGLES,
		contractorName: 'Used alternative external angles',
		clientName:     'have captured alternative external shots ',
		reportType:     [ReportType.drone,],
	},
	[SolutionVariantsEnum.CAPTURED_FROM_LEGALLY_PERMITTED_AREAS]: {
		key:            SolutionVariantsEnum.CAPTURED_FROM_LEGALLY_PERMITTED_AREAS,
		contractorName: 'Captured from legally permitted areas',
		clientName:     'have taken legal alternative aerial shots',
		reportType:     [ReportType.drone,],
	},
	[SolutionVariantsEnum.ADJUSTED_FLIGHT_PATH_TO_AVOID_OBSTRUCTIONS]: {
		key:            SolutionVariantsEnum.ADJUSTED_FLIGHT_PATH_TO_AVOID_OBSTRUCTIONS,
		contractorName: 'Adjusted flight path to avoid obstructions',
		clientName:     'have adapted the shot to avoid any obstructions',
		reportType:     [ReportType.drone,],
	},

	[SolutionVariantsEnum.REQUESTED_FURTHER_INFORMATION_FROM_THE_CLIENT]: {
		key:            SolutionVariantsEnum.REQUESTED_FURTHER_INFORMATION_FROM_THE_CLIENT,
		contractorName: 'Requested further information from the client',
		clientName:     'have requested further information from the client',
		reportType:     [ReportType.epc,],
	},

	[SolutionVariantsEnum.CANCELLATION]: {
		key:            SolutionVariantsEnum.CANCELLATION,
		contractorName: 'Cancellation',
		clientName:     'have cancelled the report',
		reportType:     [ReportType.photo, ReportType.floorplan, ReportType.video, ReportType.drone, ReportType.epc,],
	},
}

export interface IDisputeRes extends ContractorDispute {
  report: Report | null
}