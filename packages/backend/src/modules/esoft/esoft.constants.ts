import { ESoftProductTypes, } from './esoft.types'

export const products = {
	[ESoftProductTypes.PHOTO]: {
		id:      '70150001',
		variant: 'CLD_PS',
	},
	[ESoftProductTypes.VIDEO]: {
		id:      '70450001',
		variant: 'CLD_VSF45',
	},
} as const
