import Joi from 'joi';
import { logger } from '../utils/logger';

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_VERSION: Joi.string().default('v1'),
  
  // Supabase
  SUPABASE_URL: Joi.string().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  
  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  
  // Email
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  FROM_EMAIL: Joi.string().email().required(),
  FROM_NAME: Joi.string().default('Luxe Property Analysis'),
  
  // Redis
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  // File Upload
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  ALLOWED_FILE_TYPES: Joi.string().default('image/jpeg,image/png,image/webp,application/pdf'),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  LOG_FILE: Joi.string().default('logs/app.log'),
  
  // External APIs
  GOOGLE_MAPS_API_KEY: Joi.string().optional(),
  ZILLOW_API_KEY: Joi.string().optional(),
  REALTOR_API_KEY: Joi.string().optional(),
}).unknown();

export const validateEnvironment = (): void => {
  const { error, value } = envSchema.validate(process.env);
  
  if (error) {
    logger.error('❌ Environment validation failed:', error.details);
    throw new Error(`Environment validation failed: ${error.message}`);
  }
  
  // Update process.env with validated values
  Object.assign(process.env, value);
  
  logger.info('✅ Environment variables validated successfully');
};

export const getConfig = () => ({
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    from: {
      email: process.env.FROM_EMAIL!,
      name: process.env.FROM_NAME || 'Luxe Property Analysis',
    },
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ],
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  externalApis: {
    googleMaps: process.env.GOOGLE_MAPS_API_KEY,
    zillow: process.env.ZILLOW_API_KEY,
    realtor: process.env.REALTOR_API_KEY,
  },
});
