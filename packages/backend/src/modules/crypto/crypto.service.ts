import bcrypt from 'bcrypt'

import { Injectable, } from '@nestjs/common'

import { SALT_ROUNDS, } from './crypto.constants'
import { PASSWORD_OPTIONS, } from './constants/password-options.constant'

@Injectable()
export class CryptoService {
	public async hashString(password: string,): Promise<string> {
		return bcrypt.hash(password, SALT_ROUNDS,)
	}

	public async comparePasswords(plainPassword: string, hashedPassword: string,): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword,)
	}

	public async generateRandomNumber(length: number,): Promise<string> {
		let result = ''

		while (result.length < length) {
			result = result + Math.floor(Math.random() * 10,)
		}

		return result
	}

	public generateRandomPassword(characterAmount: number = 12,): string {
		let passInfo = ''
		const passChars: Array<string> = []

		passInfo = passInfo + PASSWORD_OPTIONS.num
		passChars.push(this.getRandomChar(PASSWORD_OPTIONS.num,),)

		passInfo = passInfo + PASSWORD_OPTIONS.specialChar
		passChars.push(this.getRandomChar(PASSWORD_OPTIONS.specialChar,),)

		passInfo = passInfo + PASSWORD_OPTIONS.lowerCase
		passChars.push(this.getRandomChar(PASSWORD_OPTIONS.lowerCase,),)

		passInfo = passInfo + PASSWORD_OPTIONS.upperCase
		passChars.push(this.getRandomChar(PASSWORD_OPTIONS.upperCase,),)

		while (passChars.length < characterAmount) {
			passChars.push(this.getRandomChar(passInfo,),)
		}

		for (let i = passChars.length - 1; i > 0; i--) {
			const swapIndex = Math.floor(Math.random() * (i + 1),)
			const temp = passChars[i]!
			passChars[i] = passChars[swapIndex]!
			passChars[swapIndex] = temp
		}
		return passChars.join('',)
	}

	public getRandomChar(fromString: string,): string {
		return fromString[Math.floor(Math.random() * fromString.length,)]!
	}
}
