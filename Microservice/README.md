# Spec Tree Microservice

A secure proxy service for OpenAI API interactions that handles authentication, rate limiting, and error management for the Spec Tree application.

## Overview

This microservice serves as a secure intermediary between the Spec Tree client application and OpenAI's API. It provides:

- Secure API key management
- Rate limiting
- Request validation
- Error handling
- Response formatting

## Getting Started

### Prerequisites

- Node.js 18+
- TypeScript 5+
- npm or yarn
- A valid OpenAI API key

### Environment Variables

```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key
API_KEY=your-microservice-api-key
ALLOWED_ORIGINS=http://localhost:3000
```

````

## API Endpoints

### POST /api/openai/completion

Handles OpenAI completion requests.

## Security

- API key authentication required for all requests
- CORS restrictions
- Rate limiting (100 requests per 15 minutes per IP)
- Request size limiting (1MB)
- Helmet security headers

## Error Handling

The service provides detailed error responses:

```typescript
{
  error: string;
  message: string;
  details?: any; // Additional error context (development only)
}
```

### Project Structure

```
src/
├── app.ts              # Express application setup
├── index.ts           # Application entry point
├── config/            # Configuration files
├── controllers/       # Request handlers
├── middleware/        # Custom middleware
├── routes/           # API routes
├── services/         # Business logic
└── types/            # TypeScript type definitions
```

2. Set production environment variables:

```env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your-openai-api-key
API_KEY=your-microservice-api-key
ALLOWED_ORIGINS=https://your-production-domain.com


## Monitoring

The service includes basic monitoring endpoints:

- `/api/health` - Service health check
- Standard Express error logging

## Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable via environment variables
- 429 Too Many Requests response when limit exceeded

## Error Codes

- 400: Bad Request
- 401: Unauthorized
- 429: Too Many Requests
- 500: Internal Server Error
```
````
