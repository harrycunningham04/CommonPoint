import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'
import type { IStatisticAdminDashboard, } from '../types'

export class AdminDashboardDto {
	constructor(data?: AdminDashboardDto,) {
		if (data) {
			this.earning = data.earning
			this.onTimePercentage = data.onTimePercentage
			this.averageBookingDuration = data.averageBookingDuration
			this.bookingFloorplanSla = data.bookingFloorplanSla
			this.totalPhotoCount = data.totalPhotoCount
			this.sketchPercentage = data.sketchPercentage
			this.averageBookingsPerWeek = data.averageBookingsPerWeek
			this.bookingCount = data.bookingCount
			this.bookingPhotoSla = data.bookingPhotoSla
			return
		}
		this.earning = 0
		this.onTimePercentage = 100
		this.averageBookingDuration = 0
		this.bookingFloorplanSla = 100
		this.totalPhotoCount = 0
		this.sketchPercentage = 100
		this.averageBookingsPerWeek = 0
		this.bookingCount = 0
		this.bookingPhotoSla = 100
	}

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The earning of the contractor', example: '100', },)
	public earning: number

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The on-time percentage of the contractor', example: '95', },)
	public onTimePercentage: number

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The average booking duration of the contractor', example: '100', },)
	public averageBookingDuration: number

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The booking floorplan sla of the contractor', example: '100', },)
	public bookingFloorplanSla: number

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The total photo count of the contractor', example: '100', },)
	public totalPhotoCount: number

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The sketch percentage of the contractor', example: '100', },)
	public sketchPercentage: number

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The average bookings per week of the contractor', example: '100', },)
	public averageBookingsPerWeek: number

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The booking count of the contractor', example: '100', },)
	public bookingCount: number

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The booking photo sla of the contractor', example: '100', },)
	public bookingPhotoSla: number

	private static checkPercentage(value: string | null,): number {
		return value ?
			parseFloat(value,) :
			100
	}

	public static cast(item: IStatisticAdminDashboard,): AdminDashboardDto {
		return new AdminDashboardDto({
			earning:                   item.earning ?
				parseFloat(item.earning,) :
				0,
			onTimePercentage:          this.checkPercentage(item.on_time_percentage,) === 0 ?
				100 :
				this.checkPercentage(item.on_time_percentage,),
			averageBookingDuration:    item.average_booking_duration ?
				parseFloat(item.average_booking_duration,) :
				0,
			bookingFloorplanSla:       this.checkPercentage(item.booking_floorplan_sla,),
			totalPhotoCount:           item.total_photo_count ?
				parseFloat(item.total_photo_count,) :
				0,
			sketchPercentage:          this.checkPercentage(item.sketch_percentage,),
			averageBookingsPerWeek:    item.average_bookings_per_week ?
				parseFloat(item.average_bookings_per_week,) :
				0,
			bookingCount:              item.booking_count ?
				parseFloat(item.booking_count,) :
				0,
			bookingPhotoSla:           this.checkPercentage(item.booking_photo_sla,),
		},)
	}
}