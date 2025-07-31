import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { successResponse } from 'src/common/service';
import { log } from 'src/common/logger.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  check() {
    const lhd = 'healthCheck -';
    log.info(`${lhd} success`);
    const data = { timestamp: new Date().toISOString() };
    return successResponse(data);
  }
}
