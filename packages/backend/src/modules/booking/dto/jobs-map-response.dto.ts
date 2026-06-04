import { ApiProperty, } from '@nestjs/swagger'

class LocationDto {
  @ApiProperty({ description: 'Unique identifier for the location', },)
	public id!: string

  @ApiProperty({ description: 'Google Place ID, if available', nullable: true, },)
  public placeId!: string | null

  @ApiProperty({ description: 'Latitude coordinate of the location', },)
  public latitude!: number

  @ApiProperty({ description: 'Longitude coordinate of the location', },)
  public longitude!: number

  @ApiProperty({ description: 'Associated booking ID', },)
  public bookingId!: string

  @ApiProperty({ description: 'Associated contractor ID, if any', nullable: true, },)
  public contractorId!: string | null
}

class JobLocationDto {
  @ApiProperty({ description: 'Unique identifier for the job location', },)
	public id!: string

  @ApiProperty({ description: 'Full address of the job location', },)
  public address!: string

  @ApiProperty({ description: 'Location details including coordinates and IDs', },)
  public location!: LocationDto

  @ApiProperty({ description: 'Current status of the booking', },)
  public booking_status!: string

  @ApiProperty({ description: 'Scheduled date and time of the booking in ISO format', },)
  public date_time!: string

  @ApiProperty({ description: 'Duration of the job, formatted as a string', },)
  public duration!: string
}

export class GetJobsMapResponseDto {
  @ApiProperty({ type: [JobLocationDto,], description: 'List of job locations with their details', },)
	public jobsLocation!: Array<JobLocationDto>

  @ApiProperty({ description: 'Encoded route representation for navigation', },)
  public routes!: string
}