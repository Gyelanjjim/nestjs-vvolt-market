import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from './error-code.enum';
import { log } from 'src/common/logger.util';
import { MulterError } from 'multer';
import { successResponse } from 'src/common/service';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let code = ErrorCode.INTERNAL_ERROR;

    log.error('[GlobalException]', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message =
        typeof responseBody === 'string'
          ? responseBody
          : (responseBody as any).message || message;

      // status -> code 매핑
      code =
        {
          400: ErrorCode.BAD_REQUEST,
          401: ErrorCode.UNAUTHORIZED,
          403: ErrorCode.FORBIDDEN,
          404: ErrorCode.NOT_FOUND,
          409: ErrorCode.DUPLICATED_RESOURCE,
        }[status] || ErrorCode.INTERNAL_ERROR;
    }

    // ✅ multer file too large
    if (
      exception instanceof MulterError &&
      exception.code === 'LIMIT_FILE_SIZE'
    ) {
      return response.status(400).json({
        code: 'E413',
        message: 'File size must not exceed 1MB.',
      });
    }

    response.status(status).json({
      code,
      message,
    });
  }
}
