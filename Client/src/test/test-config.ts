/**
 * Test Configuration
 *
 * Shared configuration constants for testing
 */

// API URLs for test mocks
export const TEST_STRAPI_API_URL = 'http://localhost:1337/api';
export const TEST_MICROSERVICE_URL = 'http://localhost:3001';

// Test configuration
export const TEST_CONFIG = {
  STRAPI_API_URL: TEST_STRAPI_API_URL,
  MICROSERVICE_URL: TEST_MICROSERVICE_URL,
} as const;

export default TEST_CONFIG;
