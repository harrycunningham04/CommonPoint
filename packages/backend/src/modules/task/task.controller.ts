import { Controller, Get, } from '@nestjs/common'
import { TaskService, } from './task.service'

@Controller('task',)
export class TaskController {
	constructor(private readonly taskService : TaskService,) {}

  @Get('',)
	public async processInvoicesByClient(): Promise<void> {
		await this.taskService.processInvoices()
	}
}