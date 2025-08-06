import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
  Type,
  mixin,
} from '@nestjs/common';
import * as multer from 'multer';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs'; // commonJS 모듈을 ESModule 방식으로 쓰려면 "esModuleInterop": true 추가해야한다.
import { S3MulterFile } from 'src/common/types';
import { BaseResponseDto } from 'src/common/dto/common.dto';
import { ErrorCode } from 'src/common/error-code.enum';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get<string>('AWS_S3_REGION')!,
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const today = dayjs().format('YYYYMMDD'); // ex) 20250728
    const uuid = uuidv4().replace(/-/g, ''); // 하이픈 제거된 UUID
    const key = `uploads/${today}/${uuid}`;

    // console.log(`today [${today}] uuid [${uuid}] key [${key}]`);

    const upload = new Upload({
      client: this.s3Client, // ✅ v3 전용 client
      params: {
        Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    const result = await upload.done();
    // @ts-ignore
    return result.Location; // 업로드된 public URL
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
}

/**
 * 단일 파일 업로드용 인터셉터
 */
export function S3SingleInterceptor(field: string): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    private readonly localInterceptor: NestInterceptor;

    constructor(private readonly s3Service: S3Service) {
      const InterceptorClass = FileInterceptor(field, {
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 1024 * 1024, // ✅ 1MB 제한
        },
      });
      this.localInterceptor = new InterceptorClass(); // ✅ 인스턴스 생성
    }

    async intercept(context: ExecutionContext, next: CallHandler) {
      // 1차 multer 메모리 버퍼 인터셉트
      await this.localInterceptor.intercept(context, next);

      // S3 업로드
      const req = context.switchToHttp().getRequest();
      const file = req.file;

      if (file) {
        file.location = await this.s3Service.uploadFile(file);
      }

      return next.handle(); // ⚠️ multer 인터셉터가 끝났으니 원래 흐름 반환
    }
  }

  return mixin(MixinInterceptor);
}

/**
 * 다중 파일 S3 업로드용 인터셉터
 */
export function S3MultipleInterceptor(
  field: string,
  maxCount: number,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    private readonly localInterceptor: NestInterceptor;

    constructor(private readonly s3Service: S3Service) {
      const InterceptorClass = FilesInterceptor(field, maxCount, {
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 1024 * 1024, // ✅ 1MB 제한
        },
      });
      this.localInterceptor = new InterceptorClass(); // multer 인터셉터 인스턴스
    }

    async intercept(context: ExecutionContext, next: CallHandler) {
      // 먼저 multer 메모리 버퍼 처리
      await this.localInterceptor.intercept(context, next);

      const req = context.switchToHttp().getRequest();
      const files = req.files as S3MulterFile[];

      if (files && Array.isArray(files)) {
        const locations = await this.s3Service.uploadFiles(files);
        files.forEach((file, i) => {
          file.location = locations[i];
        });
      }

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
}

export function successResponse<T>(
  data?: T,
  message = 'Success',
  code = ErrorCode.SUCCESS,
): BaseResponseDto<T> {
  return {
    code,
    message,
    ...(data !== undefined && { data }),
  };
}

export function getCurrentTime(localeTime: number = 0): string {
  return new Date(Date.now() + localeTime).toISOString();
}

export function getLogTime(): string {
  const KST = 9 * 60 * 60 * 1000;
  return getCurrentTime(KST).replace('T', ' ').substring(0, 19);
}

export function getKstTime(localeTime: Date): string {
  const kstDate = new Date(localeTime.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.toISOString();
}
