import * as nodemailer from 'nodemailer'
import { Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import type Mail from 'nodemailer/lib/mailer'
import { readFileSync, } from 'fs'
import { join, } from 'path'
import * as handlebars from 'handlebars'
import type { Template, TEMPLATE_CONTEXT_TYPES, } from './types/template.enum'

@Injectable()
export class MailService {
	private readonly transporter = nodemailer.createTransport({
		host:   'smtp.gmail.com',
		port:   465,
		secure: true,
		auth:   {
			user: process.env['EMAIL_USER'],
			pass: process.env['EMAIL_PASS'],
		},
	},)

	private readonly fromEmail: string

	constructor(private readonly configService: ConfigService,) {
		const emailUser = this.configService.get('EMAIL_USER',)
		this.fromEmail = emailUser
	}

	private renderTemplate(
		templateName: string,
		context: Record<string, any>,
	): string {
		const templatePath = join(
			process.cwd(),
			'src',
			'modules',
			'mail',
			'templates',
			`${templateName}.hbs`,
		)
		const source = readFileSync(templatePath, 'utf-8',)
		const compiled = handlebars.compile(source,)
		return compiled(context,)
	}

	public async sendEmail(options: Mail.Options,): Promise<void> {
		const mailOptions = {
			from:     this.fromEmail,
			template: 'basic',
			...options,
		}
		await this.transporter.sendMail(mailOptions,)
	}

	public async sendEmailWithTemplate<T extends Template>(
		templateName: T,
		context: TEMPLATE_CONTEXT_TYPES[T],
		options: Mail.Options,
	): Promise<void> {
		const html = this.renderTemplate(templateName, context,)
		await this.sendEmail({
			...options,
			html,
		},)
	}

	public async test(email: string,): Promise<void> {
		const html = this.renderTemplate('basic', {
			message: 'Hello, world!',
		},)
		console.log(html,)

		await this.sendEmail({
			to:      email,
			subject: 'Account created',
			html,
		},)
	}
}
