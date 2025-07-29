import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from 'src/common/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { log } from 'src/common/logger.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  await app.listen(port);
  log.info(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
