import { Controller, Get, HttpStatus, Query, Res, } from '@nestjs/common'
import { Response, } from 'express'
import { XeroService, } from '../services/xero.service'

@Controller('xero')
export class XeroController {
  constructor(private readonly xeroService: XeroService) {}

  @Get('get-xero-token')
  public async getXeroToken(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!code) {
      res.status(HttpStatus.BAD_REQUEST).send('No code provided');
      return;
    }

    try {
      await this.xeroService.getXeroToken(code);
      const html = `
        <html>
          <head><title>Xero Callback</title></head>
          <body>
            <h1>Successfully connected to Xero!</h1>
          </body>
        </html>`;
      res.setHeader('Content-Type', 'text/html');
      res.status(HttpStatus.OK).send(html);
    } catch (error) {
      console.error('Xero token error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(`Error connecting to Xero: ${error.message || error}`);
    }
  }
}