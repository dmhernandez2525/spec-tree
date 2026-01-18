import { AppError, handleError } from './error.service';

describe('AppError', () => {
  it('creates an error with statusCode and message', () => {
    const error = new AppError(404, 'Not found');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('creates an error with custom isOperational flag', () => {
    const error = new AppError(500, 'Internal error', false);

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Internal error');
    expect(error.isOperational).toBe(false);
  });

  it('has correct prototype chain', () => {
    const error = new AppError(400, 'Bad request');

    expect(error instanceof AppError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it('preserves stack trace', () => {
    const error = new AppError(500, 'Server error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('Server error');
  });
});

describe('handleError', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('logs error details to console', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at test.ts:1:1';

    handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', {
      name: 'Error',
      message: 'Test error',
      stack: 'Error: Test error\n    at test.ts:1:1',
    });
  });

  it('handles AppError instances', () => {
    const error = new AppError(400, 'Bad request');

    handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', {
      name: 'Error',
      message: 'Bad request',
      stack: expect.any(String),
    });
  });
});
