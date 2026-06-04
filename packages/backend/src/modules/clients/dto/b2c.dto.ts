/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsString, IsNotEmpty, IsNumberString, IsArray, IsBooleanString, IsEmail, IsBoolean, } from 'class-validator'
import { ClientStatus, } from '@prisma/client'
import type { B2CClientResponseDto, } from './b2c-client-response.dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { Type, } from 'class-transformer'

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
  }

export enum SortBy {
    ALPHABETIC = 'alphabetic',
    MARK = 'mark',
  }

export class FilterClientsDto {
    @IsOptional()
    @IsString()
  	public postCode?: string

    @IsOptional()
    @IsArray()
    @IsEnum(ClientStatus, { each: true, },)
    public mark?: Array<ClientStatus>

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
  @IsEnum(ClientStatus,)
  public mark?: ClientStatus

  @ApiProperty()
  @IsOptional()
  @IsString()
  public postCode?: string
}

export class ChangePasswordDto {
	@IsString()
	@IsNotEmpty()
	public oldPassword!: string

	@IsString()
	@IsNotEmpty()
	public newPassword!: string
}

export interface IB2CClientListReturn {
  clients: Array<B2CClientResponseDto>
  maxPage: number
}