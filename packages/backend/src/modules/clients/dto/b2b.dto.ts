/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsString, IsNotEmpty, IsNumberString, IsArray, IsBooleanString, IsEmail, IsBoolean, } from 'class-validator'
import { B2BClients, ClientStatus, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { B2BClientResponseDto, } from './b2b-client-response.dto'

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
  }

export enum SortBy {
    AMOUNT_OF_OFFICES = 'offices',
    ALPHABETIC = 'alphabetic',
  }

export class FilterClientsDto {
    @IsOptional()
    @IsString()
	public brand?: string

  @IsOptional()
  @IsArray()
  @IsEnum(ClientStatus, { each: true, },)
    public officeStatus?: Array<ClientStatus>

    @IsOptional()
    @IsBooleanString()
  public status?: string

    @IsOptional()
    @IsEnum(SortBy,)
    public sortBy?: SortBy

    @IsOptional()
    @IsEnum(SortDirection,)
    public sortDirection?: SortDirection

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    @Type(() => {
    	return Boolean
    },)
    public showArchived?: boolean
}

export class ClientsDto extends PageOptionsDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	  public search?: string

    @ApiProperty()
    @IsOptional()
    @Type(() => {
    	return FilterClientsDto
    },)
    public filter?: FilterClientsDto
}

export class ChangeClientDto {
 @ApiProperty()
  @IsOptional()
  @IsString()
	public firstName?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
 public lastName?: string

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  public email?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public phoneNumber?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public address?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
  public companyName?: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(ClientStatus,)
    public officeStatus?: ClientStatus

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  public archived?: boolean

  @ApiProperty()
  @IsOptional()
  @IsString()
  public billingAddress?: string
}

export interface IB2BClientListReturn {
  clients: Array<B2BClientResponseDto>
  maxPage: number
}