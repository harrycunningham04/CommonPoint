/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { MaterialTypeContent,} from '@prisma/client'
import { ESoftProductTypes, } from '@prisma/client'

export const transformOrderLineType = (orderLineType: ESoftProductTypes,):MaterialTypeContent => {
	if (orderLineType === ESoftProductTypes.PHOTO) {
		return MaterialTypeContent.PHOTOS
	}
	if (orderLineType === ESoftProductTypes.VIDEO) {
		return MaterialTypeContent.VIDEOS
	}

	throw new Error('Invalid order line type',)
}
