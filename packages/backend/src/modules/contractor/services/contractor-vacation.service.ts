/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common'
import type { CreateVacationDto, UpdateVacationDto, GetVacationsQueryDto, VacationSlotDto, } from '../dto/vacation.dto'
import { VacationResponseDto, } from '../dto/vacation.dto'
import type { Prisma,} from '@prisma/client'
import { BookingStatus, NotificationType, NotificationUrgency, VacationType, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import { endOfDay, format, isAfter, max, min, startOfDay, } from 'date-fns'
import { AvailabilityService, } from 'src/modules/availability/availability.service'
import { NotificationContractorService, } from 'src/modules/notifications/services/notification-contractor.service'
import { BasicContractorService, } from './basic-contractor.service'

@Injectable()
export class ContractorVacationService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly basicContractorService: BasicContractorService,
		private readonly notificationContractorService: NotificationContractorService,
		private readonly availabilityService: AvailabilityService,
	) {}

	public getVacationTypeMessage(vacationType: VacationType, reason?: string,): string {
		if (vacationType === VacationType.VACATION) {
			return 'Vacation'
		}
		if (vacationType === VacationType.SICK_LEAVE) {
			return 'Sick leave'
		}
		return reason!
	}

	private async validateVacationDates(contractorId: string, startDate: Date, endDate: Date, existingVacationId?: string,): Promise<void> {
		const overlappingVacations = await this.prisma.vacation.findMany({
			where: {
				contractorId,
				id:  { not: existingVacationId, },
				NOT: {
					OR: [
						{ endDate: { lt: startDate, }, },
						{ startDate: { gt: endDate, }, },
					],
				},
			},
		},)

		if (overlappingVacations.length > 0) {
			throw new BadRequestException('Vacation slot overlaps with existing vacations',)
		}

		const bookings = await this.prisma.booking.findMany({
			where: {
				contractorId,
				date_time: {
					gte: startOfDay(startDate,),
					lte: endOfDay(endDate,),
				},
				booking_status: {
					in: [BookingStatus.BOOKED, BookingStatus.IN_PROGRESS, BookingStatus.KEYS_COLLECTING,],
				},
			},
		},)

		if (bookings.length > 0) {
			throw new BadRequestException('Vacation dates overlap with existing bookings',)
		}
	}

	private validateVacationSlot(startDate: Date, endDate: Date,): void {
		if (startDate < startOfDay(new Date(),)) {
			throw new BadRequestException('Start date must be in the future',)
		}

		if (isAfter(startDate, endDate,)) {
			throw new BadRequestException('Start date must be before end date',)
		}
	}

	private validateVacationSlotList(slots: Array<VacationSlotDto>,): void {
		for (let i = 0; i < slots.length; i++) {
			this.validateVacationSlot(slots[i]!.startDate, slots[i]!.endDate,)

			for (let j = i + 1; j < slots.length; j++) {
				if (slots[i]!.startDate <= slots[j]!.endDate && slots[i]!.endDate >= slots[j]!.startDate) {
					throw new BadRequestException('Vacation slots overlap',)
				}
			}
		}
	}

	public async getContractorVacations(
		contractorId: string,
		query: GetVacationsQueryDto,
	): Promise<Array<VacationResponseDto>> {
		const whereClause: Prisma.VacationWhereInput = {
			contractorId,
		}

		if (query.startDate || query.endDate) {
			whereClause.OR = []

			if (query.startDate && query.endDate) {
				whereClause.OR.push({
					AND: [
						{ startDate: { gte: query.startDate, }, },
						{ endDate: { lte: query.endDate, }, },
					],
				},)
			} else if (query.startDate) {
				whereClause.OR.push({
					startDate: { gte: query.startDate, },
				},)
			} else if (query.endDate) {
				whereClause.OR.push({
					endDate: { lte: query.endDate, },
				},)
			}
		}

		const vacations = await this.prisma.vacation.findMany({
			where:   whereClause,
			orderBy: { startDate: 'asc', },
		},)

		return vacations.map((vacation,) => {
			return VacationResponseDto.cast(vacation,)
		},)
	}

	public async createContractorVacation(
		contractorId: string,
		createVacationDto: CreateVacationDto,
	): Promise<Array<VacationResponseDto>> {
		const { slots, vacationType, reason, } = createVacationDto

		this.validateVacationSlotList(slots,)

		await Promise.all(
			slots.map(async(slot,) => {
				await this.validateVacationDates(contractorId, slot.startDate, slot.endDate,)
			},),
		)

		const createdVacations = await Promise.all(
			slots.map(async(slot,) => {
				await this.availabilityService.deleteAvailabilitiesForDateRange(contractorId, slot.startDate, slot.endDate,)
				return this.prisma.vacation.create({
					data: {
						contractorId,
						vacationType,
						reason,
						startDate: slot.startDate,
						endDate:   slot.endDate,
					},
				},)
			},),
		)

		const contractor = await this.basicContractorService.getContractor({ id: contractorId, }, { name: true, },)

		const slotsIntervals = slots.map((slot,) => {
			return `${format(slot.startDate, 'dd/MM/yyyy',)} - ${format(slot.endDate, 'dd/MM/yyyy',)}`
		},)

		this.notificationContractorService.createNotification({
			contractorId,
			title:   `Contractor ${contractor?.name} has created a vacation`,
			message: `Contractor ${contractor?.name} has created a vacation (${this.getVacationTypeMessage(vacationType, reason,)}) for intervals ${slotsIntervals.join(', ',)}`,
			type:    NotificationType.CONTRACTOR,
			urgency: NotificationUrgency.NORMAL,
		},)

		return createdVacations.map((vacation,) => {
			return VacationResponseDto.cast(vacation,)
		},)
	}

	public async updateContractorVacation(
		vacationId: string,
		contractorId: string,
		updateVacationDto: UpdateVacationDto,
	): Promise<VacationResponseDto> {
		const existingVacation = await this.prisma.vacation.findFirst({
			where: {
				id: vacationId,
				contractorId,
			},
		},)

		if (!existingVacation) {
			throw new NotFoundException('Vacation not found',)
		}

		const updateData: Prisma.VacationUpdateInput = {}

		if (updateVacationDto.vacationType !== undefined) {
			updateData.vacationType = updateVacationDto.vacationType
		}
		if (updateVacationDto.reason !== undefined) {
			updateData.reason = updateVacationDto.reason
		}
		if (updateVacationDto.startDate !== undefined) {
			updateData.startDate = updateVacationDto.startDate
		}
		if (updateVacationDto.endDate !== undefined) {
			updateData.endDate = updateVacationDto.endDate
		}

		const startDate = updateData.startDate ?? existingVacation.startDate
		const endDate = updateData.endDate ?? existingVacation.endDate

		this.validateVacationSlot(startDate as Date, endDate as Date,)

		await this.validateVacationDates(contractorId, startDate as Date, endDate as Date, existingVacation.id,)

		const updatedVacation = await this.prisma.vacation.update({
			where: { id: vacationId, },
			data:  updateData,
		},)

		await this.availabilityService.deleteAvailabilitiesForDateRange(contractorId, startDate as Date, endDate as Date,)

		const contractor = await this.basicContractorService.getContractor({ id: contractorId, }, { name: true, },)

		const vacationLabel = this.getVacationTypeMessage(updateData.vacationType as VacationType, updateData.reason as string,)
		const initialVacationDateRange = `${format(existingVacation.startDate, 'dd/MM/yyyy',)} - ${format(existingVacation.endDate, 'dd/MM/yyyy',)}`
		const updatedVacationDateRange = `${format(startDate as Date, 'dd/MM/yyyy',)} - ${format(endDate as Date, 'dd/MM/yyyy',)}`

		this.notificationContractorService.createNotification({
			contractorId,
			title:   `Contractor ${contractor?.name} has updated a vacation`,
			message: `Contractor ${contractor?.name} has updated a vacation (${vacationLabel}) ${initialVacationDateRange} to ${updatedVacationDateRange}`,
			type:    NotificationType.CONTRACTOR,
			urgency: NotificationUrgency.NORMAL,
		},)

		return VacationResponseDto.cast(updatedVacation,)
	}

	public async deleteContractorVacation(vacationId: string, contractorId: string,): Promise<void> {
		const existingVacation = await this.prisma.vacation.findFirst({
			where: {
				id: vacationId,
				contractorId,
			},
		},)

		if (!existingVacation) {
			throw new NotFoundException('Vacation not found',)
		}

		await this.prisma.vacation.delete({
			where: { id: vacationId, },
		},)

		const contractor = await this.basicContractorService.getContractor({ id: contractorId, }, { name: true, },)

		const vacationLabel = this.getVacationTypeMessage(existingVacation.vacationType as VacationType, existingVacation.reason!,)
		const vacationDateRange = `${format(existingVacation.startDate, 'dd/MM/yyyy',)} - ${format(existingVacation.endDate, 'dd/MM/yyyy',)}`

		this.notificationContractorService.createNotification({
			contractorId,
			title:   `Contractor ${contractor?.name} has deleted a vacation`,
			message: `Contractor ${contractor?.name} has deleted a vacation (${vacationLabel}) ${vacationDateRange}`,
			type:    NotificationType.CONTRACTOR,
			urgency: NotificationUrgency.NORMAL,
		},)
	}
}
