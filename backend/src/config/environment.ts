import { cleanEnv, str, port, email, url } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  // Server
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 5000 }),
  API_VERSION: str({ default: 'v1' }),

  // Database
  DB_DIALECT: str({ choices: ['postgres', 'mysql', 'sqlite', 'mariadb', 'mssql'], default: 'postgres' }),
  DB_HOST: str({ default: 'localhost' }),
  DB_PORT: port({ default: 5432 }),
  DB_NAME: str({ default: 'delivery_app' }),
  DB_USER: str({ default: 'postgres' }),
  DB_PASSWORD: str({ default: '' }),
  DB_POOL_MAX: str({ default: '10' }),
  DB_POOL_MIN: str({ default: '2' }),
  DB_POOL_ACQUIRE: str({ default: '30000' }),
  DB_POOL_IDLE: str({ default: '10000' }),

  // JWT
  JWT_ACCESS_SECRET: str({ desc: 'Secret for access tokens' }),
  JWT_REFRESH_SECRET: str({ desc: 'Secret for refresh tokens' }),
  JWT_ACCESS_EXPIRY: str({ default: '15m' }),
  JWT_REFRESH_EXPIRY: str({ default: '7d' }),

  // Google OAuth
  GOOGLE_CLIENT_ID: str({ default: '' }),
  GOOGLE_CLIENT_SECRET: str({ default: '' }),
  GOOGLE_CALLBACK_URL: url({ default: 'http://localhost:5000/api/v1/auth/google/callback' }),

  // SendGrid
  SENDGRID_API_KEY: str({ desc: 'SendGrid API key for sending emails' }),
  SENDGRID_FROM_EMAIL: email({ desc: 'Verified sender email in SendGrid' }),
  SENDGRID_FROM_NAME: str({ default: 'Delivery App' }),

  // Frontend URL (for CORS and email links)
  FRONTEND_URL: url({ default: 'http://localhost:3000' }),

  // Security
  BCRYPT_ROUNDS: str({ default: '12' }),
  RATE_LIMIT_WINDOW_MS: str({ default: '900000' }), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: str({ default: '100' }),
  RATE_LIMIT_AUTH_MAX: str({ default: '5' }), // 5 login attempts per 15 min

  // File Upload
  MAX_FILE_SIZE: str({ default: '5242880' }), // 5MB in bytes
  UPLOAD_DIR: str({ default: 'uploads' }),

  // Misc
  LOG_LEVEL: str({ choices: ['error', 'warn', 'info', 'debug'], default: 'info' }),
});

export type Environment = typeof env;
