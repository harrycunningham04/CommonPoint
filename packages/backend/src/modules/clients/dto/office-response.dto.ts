import { ApiProperty, } from '@nestjs/swagger'
import { ClientStatus, OfficeClientType, OfficeType,} from '@prisma/client'
import type { Office, PaymentPreference, PropertyType,} from '@prisma/client'

export class OfficeResponseDto {
	constructor(data?: OfficeResponseDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.name = data.name
			this.surname = data.surname
			this.phoneNumber = data.phoneNumber
			this.email = data.email
			this.addressCoordinates = data.addressCoordinates
			this.address = data.address
			this.billingAddress = data.billingAddress
			this.officeStatus = data.officeStatus
			this.status = data.status
			this.adminId = data.adminId
			this.b2BClientsId = data.b2BClientsId
			this.preferenceId = data.preferenceId
			this.subbrandId = data.subbrandId
			this.propertyTypes = data.propertyTypes
			this.officeType = data.officeType
			this.officeClientType = data.officeClientType
			this.paymentPreferences = data.paymentPreferences
			this.numberOfWorkers = data.numberOfWorkers
		}
	}

	@ApiProperty({
		description: 'The id of the office',
		example:     '123',
	},)
	public id!: string

	@ApiProperty({
		description: 'The title of the office',
		example:     'Main Office',
	},)
	public title!: string

	@ApiProperty({
		description: 'The name of the office',
		example:     'John',
	},)
	public name!: string

	@ApiProperty({
		description: 'The surname of the office',
		example:     'Doe',
	},)
	public surname!: string

	@ApiProperty({
		description: 'The phone number of the office',
		example:     '+1234567890',
	},)
	public phoneNumber!: string

	@ApiProperty({
		description: 'The email of the office',
		example:     'john.doe@example.com',
	},)
	public email!: string

	@ApiProperty({
		description: 'The coordinates of the office',
		example:     '40.7128,-74.0060',
	},)
	public addressCoordinates!: string | null

	@ApiProperty({
		description: 'The address of the office',
		example:     '123 Main St, Anytown, USA',
	},)
	public address!: string

	@ApiProperty({
		description: 'The billing address of the office',
		example:     '123 Billing St, Anytown, USA',
	},)
	public billingAddress!: string

	@ApiProperty({
		description: 'The office status',
		example:     'NEW',
	},)
	public officeStatus!: ClientStatus

	@ApiProperty({
		description: 'The status of the office',
		example:     false,
	},)
	public status!: boolean

	@ApiProperty({
		description: 'The admin id of the office',
		example:     '123',
	},)
	public adminId!: string

	@ApiProperty({
		description: 'The B2B client id associated with the office',
		example:     '123',
	},)
	public b2BClientsId!: string | null

	@ApiProperty({
		description: 'The preference id of the office',
		example:     '123',
	},)
	public preferenceId!: string | null

	@ApiProperty({
		description: 'The subbrand id of the office',
		example:     '123',
	},)
	public subbrandId!: string | null

	@ApiProperty({
		description: 'The property types of the office',
		example:     ['RESIDENTIAL', 'COMMERCIAL',],
	},)
	public propertyTypes!: Array<PropertyType>

	@ApiProperty({
		description: 'The office type',
		example:     'RESIDENTIAL',
	},)
	public officeType!: OfficeType

	@ApiProperty({
		description: 'The office client type',
		example:     'SALES',
	},)
	public officeClientType!: OfficeClientType

	@ApiProperty({
		description: 'The payment preferences of the office',
		example:     'INVOICES',
	},)
	public paymentPreferences!: PaymentPreference

	@ApiProperty({
		description: 'The worker count of the office',
		example:     10,
	},)
	public numberOfWorkers!: number

	public static cast(office: Office,) : OfficeResponseDto {
		return new OfficeResponseDto({
			id:                 office.id,
			title:              office.title,
			name:               office.name,
			surname:            office.surname,
			phoneNumber:        office.phone_number,
			email:              office.email,
			addressCoordinates: office.address_coordinates,
			address:            office.address,
			billingAddress:     office.billing_address,
			officeStatus:       office.officeStatus,
			status:             office.status,
			adminId:            office.admin_id,
			b2BClientsId:       office.b2BClientsId,
			preferenceId:      '',
			subbrandId:         office.subbrandId,
			propertyTypes:      office.propertyTypes,
			officeType:         office.officeType,
			officeClientType:   office.officeClientType,
			paymentPreferences: office.paymentPreferences,
			numberOfWorkers:    office.numberOfWorkers,
		},)
	}
}