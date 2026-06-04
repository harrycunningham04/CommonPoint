import httpMocks from 'node-mocks-http'

import {
	it,
	describe,
	beforeAll,
	expect,
	afterEach,
} from '@jest/globals'
import { Test, } from '@nestjs/testing'

import { text, } from '../../shared/text/en'
import { AppModule, } from '../../app.module'
import { UserService, } from '../user/services/user.service'
import { JWTService, } from '../jwt/jwt.service'
import { EmailConfirmationService, } from '../user/services/email-confirmation.service'
import { CryptoService, } from '../crypto/crypto.service'
import { AuthService, } from './auth.service'
import { MOCK_EMAIL, MOCK_PASSWORD, } from './auth.constants'
import { UserRepository, } from '../../repositories/user/user.reposiitory'

describe('AuthModule', () => {
	let authService: AuthService
	let userService: UserService
	let userRepository: UserRepository

	beforeAll(async() => {
		const moduleRef = await Test.createTestingModule({
			imports:   [AppModule,],
			providers: [AuthService, UserService, JWTService, EmailConfirmationService, CryptoService, UserRepository,],
		},).compile()

		authService = moduleRef.get<AuthService>(AuthService,)
		userService = moduleRef.get<UserService>(UserService,)
		userRepository = moduleRef.get<UserRepository>(UserRepository,)
	},)

	afterEach(async() => {
		await userService.clearUsers()
	},)

	it('should create an user', async() => {
		await authService.signUp({
			email: MOCK_EMAIL, password: MOCK_PASSWORD,
		},)

		const user = await userRepository.findByEmail(MOCK_EMAIL,)

		expect(user?.email,).toBe(MOCK_EMAIL,)
	},)

	it('should throw an error if email already in use', async() => {
		await authService.signUp({
			email: MOCK_EMAIL, password: MOCK_PASSWORD,
		},)

		try {
			await authService.signUp({
				email: MOCK_EMAIL, password: MOCK_PASSWORD,
			},)

			throw new Error('fail',)
		} catch (error) {
			expect(error.message,).not.toBe('fail',)
		}
	},)

	it('should activate email by provided token', async() => {
		const {
			email,
		} = await authService.signUp({
			email: MOCK_EMAIL, password: MOCK_PASSWORD,
		},)

		const user = await userRepository.findByEmail(email,)

		expect(user?.email_confirmation?.is_confirmed,).toBeFalsy()

		await authService.activateEmail(user!.email_confirmation!.token,)

		const updatedUser = await userRepository.findByEmail(email,)

		expect(updatedUser?.email_confirmation?.is_confirmed,).toBeTruthy()
	},)

	it('should throw if provided token is invalid', async() => {
		try {
			await authService.activateEmail('46ab3f17-67e2-4268-901c-4084fbca92ae',)

			expect(true,).toBe(false,)
		} catch (error) {
			expect(error.constructor.name,).toBe('BadRequestException',)
		}
	},)

	it('should sign in if provided valid credentials', async() => {
		await authService.signUp({
			email: MOCK_EMAIL, password: MOCK_PASSWORD,
		},)

		const user = await userRepository.findByEmail(MOCK_EMAIL,)

		await authService.activateEmail(user!.email_confirmation!.token,)

		const mockResponse = httpMocks.createResponse()

		const {
			message,
		} = await authService.signIn(mockResponse, {
			email: MOCK_EMAIL, password: MOCK_PASSWORD,
		},)

		expect(message,).toBe(text.successfullyLoggenIn,)
	},)

	it('should throw if account is not activated', async() => {
		await authService.signUp({
			email: MOCK_EMAIL, password: MOCK_PASSWORD,
		},)

		const mockResponse = httpMocks.createResponse()

		try {
			await authService.signIn(mockResponse, {
				email: MOCK_EMAIL, password: MOCK_PASSWORD,
			},)
		} catch (error) {
			expect(error.constructor.name,).toBe('BadRequestException',)

			return
		}

		expect(true,).toBeFalsy()
	},)

	it('should throw if account not exist', async() => {
		const mockResponse = httpMocks.createResponse()

		try {
			await authService.signIn(mockResponse, {
				email: MOCK_EMAIL, password: MOCK_PASSWORD,
			},)
		} catch (error) {
			expect(error.constructor.name,).toBe('BadRequestException',)

			return
		}

		expect(true,).toBeFalsy()
	},)
},)
