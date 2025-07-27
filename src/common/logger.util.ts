import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';
import { getLogTime } from 'src/common/service';

// 로그 저장 디렉터리
const logDir = path.join(process.cwd(), 'data/log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// winston 로거 생성
export const log = winston.createLogger({
  level: 'debug',
  format: winston.format.printf((info) => {
    const time = getLogTime();
    return `${time} [${info.level.toUpperCase()}] ${info.message}`;
  }),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: '%DATE%.log',
      dirname: logDir,
      datePattern: 'YYYYMMDD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '7d',
      utc: false,
    }),
  ],
});
