/* eslint-disable no-mixed-spaces-and-tabs */
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common'
import { AdminService, } from '../services/admin.service'
import { Prisma,} from '@prisma/client'
import type { Admin, } from '@prisma/client'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { Roles, } from 'src/shared/roles.decorator'
import { IRequestAdmin,} from '../admin.types'
import type { EAccessType,} from '../admin.types'
import type { IAdminListReturn, } from '../admin.types'
import { ReqAdmin, } from 'src/shared/decorators/admin.decorator'
import { ChangeAdminDto, ChangePasswordDto, CreateAdminDto, GetAdminsDto, } from '../dto'
import type { Message, } from 'src/shared/types'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('admin',)
export class AdminController {
	constructor(
        private readonly adminService: AdminService,
	) { }

    @UseGuards(AdminAuthGuard,)
    @Get('admin-list',)
	public async getAdmins(@Query() query: GetAdminsDto,):Promise<IAdminListReturn> {
		return this.adminService.filteredAdmins({...query,},)
	}

    @UseGuards(RolesGuard,)
    @Roles(2,)
    @UseGuards(AdminAuthGuard,)
    @Post('add-admin',)
    public async addAdmin(@Body() body: CreateAdminDto,):Promise<Admin> {
    	return this.adminService.addAdmin({...body,},)
    }

    @UseGuards(RolesGuard,)
    @Roles(2,)
    @UseGuards(AdminAuthGuard,)
    @Patch('change-admin/:id',)
    public async changeRole(@Param('id',) adminId: string, @Body() body: ChangeAdminDto,):Promise<Admin> {
    	return this.adminService.changeAdmin(adminId, body,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Patch('change-info-me',)
    public async changeAdminInfo(@ReqAdmin() reqAdmin: IRequestAdmin, @Body() body: Prisma.AdminUpdateInput,):Promise<Admin> {
    	return this.adminService.changeAdmin(reqAdmin.id, body,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Patch('change-password-me',)
    public async changeAdminPassword(@ReqAdmin() reqAdmin: IRequestAdmin, @Body() body: ChangePasswordDto,):Promise<Message> {
    	return this.adminService.changePassword(reqAdmin.id, body,)
    }

    @Post('check-access',)
    public async checkAccess(
        @Body() { email, password, type, }: { email: string, password: string, type: EAccessType },
    ): Promise<{ access: boolean }> {
    	return this.adminService.checkAccess(email, password, type,)
    }
}

