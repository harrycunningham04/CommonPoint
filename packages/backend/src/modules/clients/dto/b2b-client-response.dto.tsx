/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
import { ApiProperty, } from '@nestjs/swagger'
import { ClientStatus,} from '@prisma/client'
import type { B2BClients, Office, } from '@prisma/client'
import { IsBoolean, IsDate, IsString, } from 'class-validator'

export class B2BClientResponseDto {
	constructor(data?: B2BClientResponseDto,) {
		if (data) {
			this.id = data.id ?? ''
			this.companyName = data.companyName ?? ''
			this.firstName = data.firstName ?? ''
			this.lastName = data.lastName ?? ''
			this.email = data.email ?? ''
			this.phoneNumber = data.phoneNumber ?? ''
			this.address = data.address ?? ''
			this.officeStatus = data.officeStatus ?? ClientStatus.NEW
			this.status = data.status ?? false
			this.archived = data.archived ?? false
			this.createdAt = data.createdAt ?? new Date()
			this.updatedAt = data.updatedAt ?? new Date()
			this.officesCount = data.officesCount ?? 0
			this.billingAddress = data.billingAddress ?? ''
			this.type = 'b2b'
		}
	}

	@ApiProperty()
    @IsString()
	public id!: string

	@ApiProperty()
    @IsString()
	public companyName!: string | null

	@ApiProperty()
    @IsString()
	public firstName!: string

	@ApiProperty()
    @IsString()
	public lastName!: string

	@ApiProperty()
    @IsString()
	public email!: string

	@ApiProperty()
    @IsString()
	public phoneNumber!: string

	@ApiProperty()
    @IsString()
	public address!: string

	@ApiProperty()
    @IsString()
	public officeStatus!: ClientStatus

	@ApiProperty()
    @IsBoolean()
	public status!: boolean

	@ApiProperty()
    @IsBoolean()
	public archived!: boolean

	@ApiProperty()
    @IsDate()
	public createdAt!: Date

	@ApiProperty()
    @IsDate()
	public updatedAt!: Date

	@ApiProperty()
    @IsString()
	public officesCount!: number

	@ApiProperty()
    @IsString()
	public type!: string

	@ApiProperty()
    @IsString()
	public billingAddress!: string

	public static cast(client: B2BClients & {
		offices?: Array<Office>,
		officesCount?: number,
	},): B2BClientResponseDto  {
		return new B2BClientResponseDto({
			id:             client.id,
			companyName:    client.companyName,
			firstName:      client.firstName ?? '',
			lastName:       client.lastName ?? '',
			email:          client.email,
			phoneNumber:    client.phoneNumber,
			address:        client.address,
			officeStatus:   client.officeStatus,
			status:         client.status,
			archived:       client.archived,
			createdAt:      client.created_at,
			updatedAt:      client.updated_at,
			officesCount:   client.offices?.length ?? 0,
			type:           'b2b',
			billingAddress: client.billingAddress ?? '',
		},)
	}
}

export class B2bClientSelectResponseDto {
	constructor(data?: B2bClientSelectResponseDto,) {
		if (data) {
			this.id = data.id 
			this.fullName = data.fullName
			this.companyName = data.companyName
		}
	}

	@ApiProperty()
	@IsString()
	public id!: string

	@ApiProperty()
	@IsString()
	public fullName!: string

	@ApiProperty()
	@IsString()
	public companyName!: string
}