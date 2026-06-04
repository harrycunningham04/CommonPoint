/* eslint-disable no-mixed-spaces-and-tabs */
import { TravelMode, } from '@googlemaps/google-maps-services-js'
import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsEnum,
	IsLatitude,
	IsLongitude,
	IsOptional,
	IsString,
} from 'class-validator'

class LatLng {
  @ApiProperty({ description: 'Latitude of the location', example: 50.4501, },)
  @IsLatitude()
	public lat!: number

  @ApiProperty({ description: 'Longitude of the location', example: 30.5234, },)
  @IsLongitude()
  public lng!: number
}

export class GetRoutesDto {
@ApiProperty()
@IsArray()
	public waypoints!: Array<string>

  @ApiProperty({
  	description: 'Travel mode for the directions request',
  	enum:        TravelMode,
  	example:     'driving',
  },)
  @IsEnum(TravelMode,)
  @IsOptional()
  @IsString()
public travelMode!: TravelMode
}
