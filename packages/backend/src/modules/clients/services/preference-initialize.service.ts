import type { OnApplicationBootstrap, } from '@nestjs/common'
import { Injectable, } from '@nestjs/common'
import { PreferencesService, } from './preferences-service'

@Injectable()
export class PreferenceInitializeService implements OnApplicationBootstrap {
	constructor(private readonly preferenceService: PreferencesService,) {}

	public async onApplicationBootstrap() : Promise<void> {
		await this.preferenceService.initializePreferences()
	}
}