/* eslint-disable arrow-body-style */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
	Controller,
	Post,
	UseInterceptors,
	UploadedFiles,
	BadRequestException,
	Body,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, } from '@nestjs/swagger'
import { ESoftTestService, } from '../services/esoft-test.service'
import { AnyFilesInterceptor, FilesInterceptor, } from '@nestjs/platform-express'
import type { Express, } from 'express'

@Controller('esoft-test',)
@ApiTags('ESOFT test',)
export class ESoftTestController {
	constructor(private readonly eSoftTestService: ESoftTestService,) {}

    @Post('create-test-order',)
    @ApiOperation({ summary: 'Create test order', },)
    @ApiConsumes('multipart/form-data',)
    @ApiBody({
    	schema: {
    		type:       'object',
    		properties: {
    			pictures: {
    				type:  'array',
    				items: {
    					type:   'string',
    					format: 'binary',
    				},
    			},
    			videos: {
    				type:  'array',
    				items: {
    					type:   'string',
    					format: 'binary',
    				},
    			},
    		},
    	},
    },)
    @UseInterceptors(AnyFilesInterceptor(),)
	public async createTestOrder(
        @UploadedFiles() files: Array<Express.Multer.File>,
	) {
		if (files.length === 0) {
			throw new BadRequestException('No files uploaded',)
		}
		const videos = files.filter((file,) => file.fieldname === 'videos',)
		const pictures = files.filter((file,) => file.fieldname === 'pictures',)
		return this.eSoftTestService.createTestOrder(pictures, videos,)
	}

	@Post('edit-materials',)
    public async editMaterials(@Body() body: { id: string, },) {
    	return this.eSoftTestService.editMaterials(body.id,)
    }
}
