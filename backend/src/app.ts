import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/errorMiddleware';
import { rateLimiter } from './middleware/rateLimitMiddleware';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import customerRoutes from './routes/customerRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import couponRoutes from './routes/couponRoutes';
import returnRoutes from './routes/returnRoutes';

const app = express();

// Global Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

// Root API Index & Health Check
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'REXBEBE REST API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      auth: '/api/auth',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      customers: '/api/customers',
      inventory: '/api/inventory',
      coupons: '/api/coupons',
      returns: '/api/returns',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'REXBEBE E-Commerce Backend Service',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// REST API Routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/returns', returnRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
