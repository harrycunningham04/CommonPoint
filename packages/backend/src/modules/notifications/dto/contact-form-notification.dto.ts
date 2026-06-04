import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'

export class HelpCreateB2BAccountNotificationQuery  {
    @ApiProperty({description: 'Email of client', type: String,},)
    @IsNotEmpty()
    @IsString()
	public email!:string

    @ApiProperty({description: 'Client name', type: String,},)
    @IsNotEmpty()
    @IsString()
    public name!:string

    @ApiProperty({description: 'Client surname', type: String,},)
    @IsNotEmpty()
    @IsString()
    public surname!:string

    @ApiProperty({description: 'Client phone', type: String,},)
    @IsNotEmpty()
    @IsString()
    public phone!:string
}

export class LetUsKnowUnavailableRegionNotificationQuery  {
    @ApiProperty({description: 'Email of client', type: String,},)
    @IsNotEmpty()
    @IsString()
	public email!:string

    @ApiProperty({description: 'Details', type: String,},)
    @IsNotEmpty()
    @IsString()
    public details!:string

    @ApiProperty({description: 'Unavailabel address client', type: String,},)
    @IsNotEmpty()
    @IsString()
    public address!:string

    @ApiProperty({description: 'Client name', type: String,},)
    @IsNotEmpty()
    @IsString()
    public name!:string

    @ApiProperty({description: 'Client surname', type: String,},)
    @IsNotEmpty()
    @IsString()
    public surname!:string
}