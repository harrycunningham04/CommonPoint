import { Injectable, } from '@nestjs/common'
import { join, } from 'path'
import type { Response, } from 'express'
import { existsSync, } from 'fs'
@Injectable()
export class AppService {
	public async returnFile(res: Response, file: string,): Promise<void> {
		const filePath = join(process.cwd(), 'public', '.well-known', file,)
		if (existsSync(filePath,)) {
			res.sendFile(filePath,)
			return
		}
		const fileWithExtension = join(process.cwd(), 'public', '.well-known', `${file}.json`,)
		if (existsSync(fileWithExtension,)) {
			res.sendFile(fileWithExtension,)
			return
		}
		res.status(404,).send('File not found',)
	}
}
