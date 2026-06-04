/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
import { ApiProperty, } from '@nestjs/swagger'
import { ClientStatus,} from '@prisma/client'
import type { B2CClients, } from '@prisma/client'
import { IsArray, IsBoolean, IsDate, IsString, } from 'class-validator'

export class B2CClientResponseDto {
	constructor(data?: B2CClientResponseDto,) {
		if (data) {
			this.id = data.id ?? ''
			this.firstName = data.firstName ?? ''
			this.lastName = data.lastName ?? ''
			this.email = data.email ?? ''
			this.phoneNumber = data.phoneNumber ?? ''
			this.address = data.address ?? ''
			this.mark = data.mark ?? ClientStatus.NEW
			this.status = data.status ?? false
			this.archived = data.archived ?? false
			this.postCode = data.postCode ?? ''
			this.createdAt = data.createdAt ?? new Date()
			this.updatedAt = data.updatedAt ?? new Date()
			this.type = 'b2c'
		}
	}

	@ApiProperty()
    @IsString()
	public id!: string

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
	public mark!: ClientStatus

	@ApiProperty()
    @IsBoolean()
	public status!: boolean

	@ApiProperty()
    @IsBoolean()
	public archived!: boolean

	@ApiProperty()
    @IsString()
	public postCode!: string

	@ApiProperty()
    @IsDate()
	public createdAt!: Date

	@ApiProperty()
    @IsDate()
	public updatedAt!: Date

	@ApiProperty()
    @IsString()
	public type!: string

	public static cast(client: B2CClients,): B2CClientResponseDto  {
		return new B2CClientResponseDto({
			id:           client.id,
			firstName:    client.firstName,
			lastName:     client.lastName,
			email:        client.email,
			phoneNumber:  client.phoneNumber,
			address:      client.address,
			mark:         client.mark,
			status:       client.status,
			archived:     client.archived,
			postCode:     client.postCode ?? '',
			createdAt:    client.created_at,
			updatedAt:    client.updated_at,
			type:         'b2c',
		},)
	}
}