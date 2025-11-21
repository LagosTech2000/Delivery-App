import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from '../config/environment';
import path from 'path';

const logDir = 'logs';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
      msg += `\n${meta.stack}`;
    }
    return msg;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    level: env.LOG_LEVEL,
  }),
];

if (env.NODE_ENV === 'production') {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      level: 'info',
    }),
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
      level: 'error',
    })
  );
}

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  transports,
  exitOnError: false,
});

export default logger;
