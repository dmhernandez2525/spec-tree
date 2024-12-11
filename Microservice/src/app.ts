import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimiter } from './middleware/rate-limit';
// import { apiKeyAuth } from './middleware/security'; // Uncomment this line to enable API key authentication
import routes from './routes';

const app = express();

// Global middleware
app.use(
  express.json({
    limit: '1mb',
    strict: true,
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
    exposedHeaders: ['Content-Type'],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

app.use(
  helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: true,
    xssFilter: true,
  })
);

// Use combined logging format for production, dev format for development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Apply rate limiting
app.use(rateLimiter);

// API key authentication
// app.use(apiKeyAuth);

// Mount API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
