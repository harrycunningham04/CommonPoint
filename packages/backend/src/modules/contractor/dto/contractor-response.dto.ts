/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
import { ApiProperty, } from '@nestjs/swagger'
import { ContractorMark, type Contractor, type ContractorSkills, type Equipment, type EquipmentType, type Skills, } from '@prisma/client'

export class ContractorResponseDto {
	constructor(data: ContractorResponseDto,) {
		if (data) {
			this.id = data.id ?? ''
			this.createdAt = data.createdAt ?? new Date()
			this.updatedAt = data.updatedAt ?? new Date()
			this.name = data.name ?? ''
			this.surname = data.surname ?? ''
			this.archived = data.archived ?? false
			this.avatar = data.avatar ?? null
			this.transportation = data.transportation ?? null
			this.mark = data.mark ?? ContractorMark.BRONZE
			this.priority = data.priority ?? false
			this.phone = data.phone ?? ''
			this.email = data.email ?? ''
			this.postCode = data.postCode ?? null
			this.portfolio = data.portfolio ?? null
			this.address = data.address ?? ''
			this.regions = data?.regions ?? []
			this.radius = data.radius ?? 0
			this.onSite = data.onSite ?? false
			this.active = data.active ?? false
			this.skills = data?.skills ?? []
			this.rating = data.rating ?? 0
			this.regionNames = data?.regionNames ?? []
			this.equipments = data?.equipments ?? []
			this.isBookable = data?.isBookable ?? false
		}
	}

	@ApiProperty({
		description: 'The contractor ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	public id!: string

	@ApiProperty({
		description: 'The contractor creation date',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public createdAt!: Date

	@ApiProperty({
		description: 'The contractor last update date',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public updatedAt!: Date

	@ApiProperty({
		description: 'The contractor name',
		example:     'John',
	},)
	public name!: string

	@ApiProperty({
		description: 'The contractor surname',
		example:     'Doe',
	},)
	public surname!: string

	@ApiProperty({
		description: 'Whether the contractor is archived',
		example:     false,
	},)
	public archived!: boolean

	@ApiProperty({
		description: 'The contractor avatar URL',
		example:     null,
	},)
	public avatar!: string | null

	@ApiProperty({
		description: 'The contractor transportation type',
		example:     'CAR',
	},)
	public transportation!: string | null

	@ApiProperty({
		description: 'The contractor mark',
		example:     ContractorMark.BRONZE,
	},)
	public mark!: ContractorMark

	@ApiProperty({
		description: 'Whether the contractor is priority',
		example:     true,
	},)
	public priority!: boolean

	@ApiProperty({
		description: 'The contractor phone number',
		example:     '+1234567890',
	},)
	public phone!: string

	@ApiProperty({
		description: 'The contractor email',
		example:     'john@example.com',
	},)
	public email!: string

	@ApiProperty({
		description: 'The contractor post code',
		example:     null,
	},)
	public postCode!: string | null

	@ApiProperty({
		description: 'The contractor portfolio URL',
		example:     null,
	},)
	public portfolio!: string | null

	@ApiProperty({
		description: 'The contractor address',
		example:     '123 Main St',
	},)
	public address!: string

	@ApiProperty({
		description: 'The contractor regions',
		example:     [],
	},)
	public regions!: Array<string>

	@ApiProperty({
		description: 'The contractor radius',
		example:     3,
	},)
	public radius!: number

	@ApiProperty({
		description: 'Whether the contractor is on site',
		example:     true,
	},)
	public onSite!: boolean

	@ApiProperty({
		description: 'Whether the contractor is active',
		example:     true,
	},)
	public active!: boolean

	@ApiProperty({
		description: 'The contractor skills',
		example:     [{
			id:         '0303046e-eda8-462d-a9ae-abb36a413684',
			name:       'FLOORPLAN',
			icon:       ' ',
			created_at: '2025-02-28T16:06:42.435Z',
			updated_at: '2025-02-28T16:06:42.435Z',
		},],
	},)
	public skills!: Array<{
		id:         string,
		name:       string,
		icon:       string,
		created_at: Date,
		updated_at: Date,
	}>

	@ApiProperty({
		description: 'The contractor rating',
		example:     3.5,
	},)
	public rating!: number

	@ApiProperty({
		description: 'The contractor region names',
		example:     [],
	},)
	public regionNames!: Array<string>

	@ApiProperty({
		description: 'The contractor equipments',
		example:     [],
	},)
	public equipments!: Array<Equipment>

	@ApiProperty({
		description: 'Whether the contractor is bookable',
		example:     true,
	},)
	public isBookable!: boolean

	public static cast(contractor: Contractor & {
		skills?: Array<ContractorSkills & {
			skill: Skills,
		}>,
		regions?: Array<{
			region: {
				name: string,
			},
		}>,
		equipments?: Array<{
			id:         string,
			equipmentType: EquipmentType,
			brand:         string,
			model:         string,
			createdAt:     Date,
			contractorId:  string,
		}>,
		availableDays?: Array<{
			date_time: Date,
		}>,
	},): ContractorResponseDto {
		return new ContractorResponseDto({
			id:             contractor.id,
			createdAt:      contractor.created_at,
			updatedAt:      contractor.updated_at,
			name:           contractor.name,
			surname:        contractor.surname,
			archived:       contractor.archived,
			avatar:         contractor.avatar,
			transportation: contractor.transportation,
			mark:           contractor.mark ?? ContractorMark.BRONZE,
			priority:       contractor.priority,
			phone:          contractor.phone ?? '',
			email:          contractor.email,
			postCode:       contractor.postCode,
			portfolio:      contractor.portfolio,
			address:        contractor.address ?? '',
			isBookable:     (contractor.availableDays?.length ?? 0) > 0,
			regions:        contractor.regions?.map((r,) => {
				return r.region.name
			},) ?? [],
			radius:         contractor.radius,
			onSite:         contractor.onSite,
			active:         contractor.active,
			skills:         contractor.skills?.filter((s,) => {
				return s.confirmed
			},).map((s,) => {
				return s.skill
			},) ?? [],
			rating:         contractor.rating,
			regionNames:    contractor.regions?.map((r,) => {
				return r.region.name
			},) ?? [],
			equipments:     contractor.equipments ?? [],
		},)
	}
}