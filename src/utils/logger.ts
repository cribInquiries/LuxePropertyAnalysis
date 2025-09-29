import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Detect serverless (Vercel) environment: avoid filesystem writes
const isServerless = Boolean(process.env.VERCEL);

// Ensure logs directory exists only in non-serverless environments
const logsDir = path.join(process.cwd(), 'logs');
if (!isServerless) {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  } catch {
    // Ignore filesystem errors in restricted environments
  }
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'luxe-property-api' },
  transports: isServerless
    ? []
    : [
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
  exceptionHandlers: isServerless
    ? []
    : [
        new winston.transports.File({
          filename: path.join(logsDir, 'exceptions.log'),
        }),
      ],
  rejectionHandlers: isServerless
    ? []
    : [
        new winston.transports.File({
          filename: path.join(logsDir, 'rejections.log'),
        }),
      ],
});

// Add console transport (always in serverless; in dev for local)
if (isServerless || process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Create a stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
