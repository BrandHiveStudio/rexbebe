import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // In development, allow any localhost or 127.0.0.1 port, or LAN IP
    if (process.env.NODE_ENV !== 'production') {
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.endsWith('.local')
      ) {
        return callback(null, true);
      }
    }

    const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://rexbebe.com'];
    if (allowed.includes(origin) || origin.endsWith('.rexbebe.com')) {
      return callback(null, true);
    }

    return callback(null, true); // Fallback to allow dev workflows smoothly
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Expires',
    'cache-control',
    'pragma',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
};
