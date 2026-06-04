/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type { EditRequest, EditRequestMaterial, EditRequestSession, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsArray, IsString, ValidateNested, } from 'class-validator'

export class GetRequestedMaterialsDto {
	constructor(data? : GetRequestedMaterialsDto,) {
		if (data) {
			this.quantity = data.quantity
			this.comments = data.comments
			this.httpFiles = data.httpFiles
			this.orderLineId = data.orderLineId
		}
	}

    @ApiProperty({
    	description: 'The quantity of the requested materials',
    	example:     1,
    },)
    @IsNumber()
    @IsNotEmpty()
	public quantity!: number

    @ApiProperty({
    	description: 'The comments of the requested materials',
    	example:     ['This is a comment', 'This is another comment',],
    },)
    @IsArray()
    @IsNotEmpty()
    @IsString({ each: true, },)
    public comments!: Array<string>

    @ApiProperty({
    	description: 'The http files of the requested materials',
    	example:     [],
    },)
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true, },)
    @Type(() => {
    	return GetRequestedMaterialsHttpFileDto
    },)
    public httpFiles!: Array<GetRequestedMaterialsHttpFileDto>

    @ApiProperty({
    	description: 'The order line id of the requested materials',
    	example:     1,
    },)
    @IsString()
    @IsNotEmpty()
    public orderLineId!: string

    public static cast(
    	session: EditRequestSession & {
            editRequests: Array<EditRequest & { editRequestMaterials: Array<EditRequestMaterial> }>
        },
    ): GetRequestedMaterialsDto {
    	const httpFiles = session.editRequests.flatMap((editRequest,) => {
    		return editRequest.editRequestMaterials.map(
    			(editRequestMaterial,) => {
    				return new GetRequestedMaterialsHttpFileDto({
    					url:  editRequestMaterial.url,
    					name: editRequestMaterial.name,
    					size: editRequestMaterial.fileSize ?? 0,
    				},)
    			},
    	)
    	},
    	)

    	return new GetRequestedMaterialsDto({
    		quantity: httpFiles.length,
    		comments: session.editRequests.map((editRequest,) => {
    			return editRequest.requestedChange
    		},),
    		httpFiles,
    		orderLineId: session.editRequests[0]?.orderLineId!,
    	},)
    }
}

export class GetRequestedMaterialsHttpFileDto {
	constructor(data? : GetRequestedMaterialsHttpFileDto,) {
		if (data) {
			this.url = data.url
			this.name = data.name
			this.size = data.size
		}
	}

    @ApiProperty({
    	description: 'The url of the http file',
    	example:     'https://www.example.com/file.jpg',
    },)
    @IsString()
    @IsNotEmpty()
	public url!: string

    @ApiProperty({
    	description: 'The name of the http file',
    	example:     'file.jpg',
    },)
    @IsString()
    @IsNotEmpty()
    public name!: string

    @ApiProperty({
    	description: 'The size of the http file',
    	example:     100,
    },)
    @IsNumber()
    @IsNotEmpty()
    public size!: number
}
