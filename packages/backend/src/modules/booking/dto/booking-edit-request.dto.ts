/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ApiProperty, } from '@nestjs/swagger'
import type { Admin, EditRequest, EditRequestMaterial, EditRequestSession,} from '@prisma/client'
import { EditRequestType, MaterialTypeContent, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsEnum, IsNumber, IsString, } from 'class-validator'
import { IsOptional, } from 'class-validator'
import { EMaterialTypeContent, } from 'src/shared/types/booking.types'

export class EditRequestAttachmentDto {
	constructor(data?: EditRequestAttachmentDto,) {
		if (data) {
			this.id = data.id
			this.url = data.url
			this.name = data.name
			this.fileSize = data.fileSize
			this.requestedChange = data.requestedChange
		}
	}

    @ApiProperty()
    @IsString()
	public id!: string

    @ApiProperty()
    @IsString()
    public url!: string

    @ApiProperty()
    @IsString()
    public name!: string

    @ApiProperty()
    @IsNumber()
    public fileSize!: number

	@ApiProperty()
	@IsString()
	@IsOptional()
    public requestedChange?: string
}

export class EditRequestDto {
	constructor(data?: EditRequestDto,) {
		if (data) {
			this.id = data.id
			this.adminFullName = data.adminFullName
			this.contentType = data.contentType
			this.dateTime = data.dateTime
			this.requestedChange = data.requestedChange
			this.attachments = data.attachments
			this.type = data.type
		}
	}

	@ApiProperty()
	@IsString()
	public id!: string

	@ApiProperty()
	@IsString()
	public adminFullName!: string

	@ApiProperty()
	@IsEnum(EditRequestType,)
	public type!: EditRequestType

	@ApiProperty()
	@IsEnum(EMaterialTypeContent,)
	@IsOptional()
	public contentType?: EMaterialTypeContent | null

	@ApiProperty()
	@IsString()
	public dateTime!: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	public requestedChange?: string

	@ApiProperty()
	@IsArray()
	@Type(() => {
		return EditRequestAttachmentDto
	},)
	public attachments!: Array<EditRequestAttachmentDto>

	public static castGroupedEditRequest(editRequest: Array<EditRequest & { editRequestMaterials: Array<EditRequestMaterial> , admin?: Admin | null }>,): Array<EditRequestDto> {
		return editRequest.map((editRequest,) => {
			return new EditRequestDto({
				id:              editRequest.id,
				adminFullName:   `${editRequest.admin?.name ?? ''} ${editRequest.admin?.surname ?? ''}`.trim(),
				contentType:     (editRequest.contentType as EMaterialTypeContent) ?? MaterialTypeContent.PHOTOS,
				dateTime:        editRequest.createdAt.toISOString(),
				requestedChange: editRequest.requestedChange,
				type:            editRequest.type,
				attachments:     editRequest.editRequestMaterials.map((material,) => {
					return new EditRequestAttachmentDto({
						id:       material.id,
						url:      material.url,
						name:     material.name,
						fileSize: material.fileSize ?? 0,
					},)
				},),
			},)
		},)
	}

	public static castEditRequestSingle(
		sessions: Array<EditRequestSession & {
			editRequests: Array<
				EditRequest & {
					editRequestMaterials: Array<EditRequestMaterial>;
					admin?: Admin | null;
				}
			>;
		}>,
	): Array<EditRequestDto> {
		return sessions
			.filter((session,) => {
				return session.editRequests.length > 0
			},)
			.map((session,) => {
				const firstEditRequest = session.editRequests[0] as EditRequest & {
				editRequestMaterials: Array<EditRequestMaterial>;
				admin?: Admin | null;
			}

				const attachments = session.editRequests.flatMap((editRequest,) => {
					return editRequest.editRequestMaterials.map((material,) => {
						return new EditRequestAttachmentDto({
							id:              material.id,
							url:             material.url,
							name:            material.name,
							fileSize:        material.fileSize ?? 0,
							requestedChange: editRequest.requestedChange,
						},)
					},)
				},
				)

				return new EditRequestDto({
					id:            firstEditRequest.id,
					adminFullName: `${firstEditRequest.admin?.name ?? ''} ${firstEditRequest.admin?.surname ?? ''}`.trim(),
					contentType:   (firstEditRequest.contentType as EMaterialTypeContent) ?? MaterialTypeContent.PHOTOS,
					dateTime:      session.createdAt.toISOString(),
					type:          firstEditRequest.type,
					attachments,
				},)
			},)
	}
}
