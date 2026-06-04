import { BookingStatus, type Prisma, } from '@prisma/client'

export const SelectBookingSkills = Object.freeze({
	BookingToProductType: {
		include: {
			productType: {
				include: {
					adjustments:       true,
					productTypeSkills: {
						include: {
							skill: true,
						},
					},
				},
			},
		},
	},
},)

export const IncludeAllBookingInfo = Object.freeze({
	location:               true,
	keyLocation:            true,
	Attachment:             true,
	b2BClients:             true,
	b2CClients:             true,
	rawMaterial:           true,
	bookingRoute:        true,
	BookingStageHistory:    true,
	EditRequest:         true,
	editedMaterial:         {
		include: {
			editRequest: {
				include: {
					editRequestMaterials: true,
				},
			},
		},
	},
	office:                 true,
	contractor:     {
		select: {
			transportation:     true,
			name:               true,
			phone:              true,
			surname:            true,
			avatar:             true,
			onSite:             true,
			ContractorLocation: {
				select: {
					latitude:  true,
					longitude: true,
				},
			},
		},
	},
	BookingCGIClientPhotos: {
		include: {
			submittedMaterial: {
				include: {
					editRequest: {
						include: { editRequestMaterials: true, },
					},
				},
			},
		},
	},
	...SelectBookingSkills,

},)

export const CancellationWhere: Prisma.BookingWhereInput = {
	contractorDisputes: {
		some: {
			report: {
				isCancellation: true,
			},
		},
	},
} as const

export const BookingContractorOffsiteWhere = Object.freeze({
	EditRequest:            {
		select: {
			id: true,
		},
	},
	BookingCGIClientPhotos: {
		include: { submittedMaterial: {
			include: {
				editRequest: {
					include: {
						editRequestMaterials: true,
					},
				},
			},
		},
		},
	},
	...SelectBookingSkills,
},)

export const basicBookingClientWhere: Prisma.BookingWhereInput = {
	booking_status: {
		notIn: [BookingStatus.AWAITING_PAYMENT, BookingStatus.CANCELED,],
	},
}
