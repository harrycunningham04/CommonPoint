/* eslint-disable complexity */
import { ApiProperty, } from '@nestjs/swagger'
import { Type, } from 'class-transformer'
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, } from 'class-validator'
import type { IStatisticDashboard, } from '../types'
import { calculatePercentageOfIncomeIncrease, } from '../utils'
import moment from 'moment-timezone'

export class DashboardItemDto {
	constructor(data?: DashboardItemDto,) {
		if (data) {
			this.id = data.id
			this.label = data.label
			this.onTimePercent = data.onTimePercent
			this.earning = data.earning
			this.expectedEarning = data.expectedEarning
			this.accuracy = data.accuracy
			this.rating = data.rating
			this.prevRating = data.prevRating
			this.averageTime = data.averageTime
			this.revenuePercent = data.revenuePercent
			return
		}
		this.id = ''
		this.label = ''
		this.onTimePercent = 0
		this.earning = 0
		this.expectedEarning = 0
		this.accuracy = 0
		this.rating = ''
		this.prevRating = ''
		this.averageTime = 0
		this.revenuePercent = ''
	}

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the contractor', example: 'month-1', },)
	public id: string

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The label of the contractor', example: 'month-1', },)
  public label: string

	@IsNumber()
	@ApiProperty({ description: 'The earning of the contractor', example: 100, },)
	public earning: number

  @IsNumber()
  @ApiProperty({ description: 'The expected earning of the contractor', example: 100, },)
	public expectedEarning: number

  @IsNumber()
  @ApiProperty({ description: 'The on-time percentage of the contractor', example: 95, },)
  public onTimePercent: number

	@IsNumber()
  @ApiProperty({ description: 'The accuracy of the contractor', example: 95, },)
  public accuracy: number

  @IsString()
  @ApiProperty({ description: 'The rating of the contractor', example: '4.5', },)
	public rating: string

  @IsString()
  @ApiProperty({ description: 'The previous rating of the contractor', example: '4.5', },)
  public prevRating: string

  @IsNumber()
  @ApiProperty({ description: 'The average time of the contractor', example: 100, },)
  public averageTime: number

  @IsString()
  @ApiProperty({ description: 'The revenue percent of the contractor', example: '100', },)
  public revenuePercent: string

  private static checkPercentage(value: string | null,): number {
  	return value ?
  		parseFloat(value,) :
  		100
  }

  public static cast(item: IStatisticDashboard, prevEarning: number, isWeek: boolean,): DashboardItemDto {
  	const now = new Date()
  	const timePeriod = Number(item.time_period,)
  	if (!isWeek) {
  		now.setMonth(now.getMonth() - timePeriod,)
  	}
  	if (isWeek) {
  		const day = now.getDay()
  		const diff = (day === 0 ?
  			-6 :
  			1 - day)
  		now.setDate(now.getDate() + diff,)
  		now.setDate(now.getDate() - (timePeriod * 7),)
  	}

  	const endDate = new Date(now,)
  	endDate.setDate(endDate.getDate() + 4,)

  	const momentNow = moment(now,)
  	const momentEndDate = moment(endDate,)

  	const label = isWeek ?
  		`${momentNow.format('DD.MM',)} - ${momentEndDate.format('DD.MM',)}` :
  		now.toLocaleString('default', { month: 'short', },)

  	const id = isWeek ?
  		`week-${now.getMonth()}-${now.getDate()}` :
  		`month-${now.getMonth()}`

  	return new DashboardItemDto({
  		id,
  		label,
  		onTimePercent:   this.checkPercentage(item.on_time_percentage,),
  		earning:         item.earning ?
  			parseFloat(item.earning,) :
  			0,
  		expectedEarning: item.contractor_expected_earnings ?
  			parseFloat(item.contractor_expected_earnings,) :
  			0,
  		accuracy:        this.checkPercentage(item.booking_floorplan_sla,),
  		rating:          item.average_booking_rating?.toString() ?? '5',
  		prevRating:      item.booking_rating_count?.toString() ?? '0',
  		averageTime:     this.checkPercentage(item.average_booking_duration,),
  		revenuePercent:  calculatePercentageOfIncomeIncrease(prevEarning, Number(item.earning,),),
  	},)
  }
}

export class DashboardDataDto {
	constructor(data?: DashboardDataDto,) {
		if (data) {
			this.week = data.week
			this.month = data.month
			return
		}
		this.week = []
		this.month = []
	}

	@ApiProperty({ description: 'The week data', type: [DashboardItemDto,], },)
	@IsArray()
	@ValidateNested({ each: true, },)
	@Type(() => {
		return DashboardItemDto
	},)
	public week: Array<DashboardItemDto>

	@ApiProperty({ description: 'The month data', type: [DashboardItemDto,], },)
	@IsArray()
	@ValidateNested({ each: true, },)
	@Type(() => {
		return DashboardItemDto
	},)
	public month: Array<DashboardItemDto>
}
