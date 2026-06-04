import {
	it,
	describe,
	beforeAll,
	expect,
} from '@jest/globals'
import { Test, } from '@nestjs/testing'

import { AppModule, } from '../../app.module'
import { CryptoService, } from './crypto.service'
import { MOCK_PASSWORD, } from './crypto.constants'

describe('CryptoModule', () => {
	let cryptoService: CryptoService

	beforeAll(async() => {
		const moduleRef = await Test.createTestingModule({
			imports:   [AppModule,],
			providers: [CryptoService,],
		},).compile()

		cryptoService = moduleRef.get<CryptoService>(CryptoService,)
	},)

	it('should hash a password', async() => {
		const hasedPassword = await cryptoService.hashString(MOCK_PASSWORD,)

		expect(hasedPassword,).toHaveLength(60,)
	},)

	it('should return true on valid string compare', async() => {
		const hasedPassword = await cryptoService.hashString(MOCK_PASSWORD,)

		const isValid = await cryptoService.comparePasswords(MOCK_PASSWORD, hasedPassword,)

		expect(isValid,).toBeTruthy()
	},)

	it('should return true on invalid string compare', async() => {
		const hasedPassword = await cryptoService.hashString(MOCK_PASSWORD,)

		const isValid = await cryptoService.comparePasswords('Wrong Password', hasedPassword,)

		expect(isValid,).toBeFalsy()
	},)
},)
