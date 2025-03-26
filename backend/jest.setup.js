// jest.setup.js
// Global test setup and mocks

// Mock AWS SDK
jest.mock('aws-sdk', () => {
    return {
      DynamoDB: {
        DocumentClient: jest.fn(() => ({
          put: jest.fn().mockReturnThis(),
          get: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          query: jest.fn().mockReturnThis(),
          promise: jest.fn()
        }))
      }
    };
  });
  
  // Set up environment variables for testing
  process.env.USERS_TABLE = 'test-users-table';
  process.env.STAGE = 'test';
  
  // Global error handler for unhandled promise rejections
  process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
  });