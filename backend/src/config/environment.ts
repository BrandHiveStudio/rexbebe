import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'rexbebe_fallback_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  payments: {
    payhere: {
      merchantId: process.env.PAYHERE_MERCHANT_ID || '',
      secret: process.env.PAYHERE_SECRET || '',
    },
    onepay: {
      merchantId: process.env.ONEPAY_MERCHANT_ID || '',
      secret: process.env.ONEPAY_SECRET || '',
    },
  },
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT) || 2525,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@rexbebe.com',
  },
};
