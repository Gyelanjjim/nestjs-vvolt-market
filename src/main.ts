import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from 'src/common/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { log } from 'src/common/logger.util';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 허용
  app.enableCors({
    origin: '*',
  });

  // request body 제한 해제 (Express 자체 제한을 피함)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Swagger API 문서 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VVolt Market API')
    .setDescription('중고거래 마켓 시스템')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document); // http://localhost:<port>/api

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const server = configService.get<number>('SERVER') || 'http://localhost';

  // 전역 예외 필터
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  await app.listen(port);
  log.info(`🚀 Application is running on: ${server}:${port}`);
  log.info(`📘 Swagger is available at: ${server}:${port}/api`);
}

bootstrap();
