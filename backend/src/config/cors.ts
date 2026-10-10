import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://rexbebe.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
