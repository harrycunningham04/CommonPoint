/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'

export class Availability {
    @ApiProperty({
    	type:        String,
    	description: 'Availability ID',
    },)
	public id?: string

    @ApiProperty({
    	description: 'Count of bookings for this day',
    	type:        Number,
    },)
    public booked!: number

    @ApiProperty({
    	description: 'Date of the availability day',
    	type:        Date,
    },)
    public date_time!: Date

    @ApiProperty({
    	description: 'Availability hours',
    	type:        Array<Array<number>>,
    },)
    public availability!: Array<Array<number>>

    @ApiProperty({
    	description: 'Is contractor on vacation this day',
    	type:        Boolean,
    },)
    public isVacation!: boolean
}