import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.stubEnv('NODE_ENV', originalNodeEnv);
    vi.restoreAllMocks();
  });

  describe('logger interface', () => {
    it('has log method', () => {
      expect(typeof logger.log).toBe('function');
    });

    it('has warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('has error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('has info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('has debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('error logging', () => {
    it('always logs errors regardless of environment', () => {
      // Error should always log
      logger.error('Test error');

      expect(console.error).toHaveBeenCalledWith('Test error');
    });

    it('logs error with multiple arguments', () => {
      logger.error('Error:', { code: 500 }, 'details');

      expect(console.error).toHaveBeenCalledWith('Error:', { code: 500 }, 'details');
    });
  });

  describe('logging methods', () => {
    it('can call log without throwing', () => {
      expect(() => logger.log('test')).not.toThrow();
    });

    it('can call warn without throwing', () => {
      expect(() => logger.warn('test')).not.toThrow();
    });

    it('can call info without throwing', () => {
      expect(() => logger.info('test')).not.toThrow();
    });

    it('can call debug without throwing', () => {
      expect(() => logger.debug('test')).not.toThrow();
    });

    it('handles various argument types', () => {
      expect(() => {
        logger.log('string', 123, { obj: true }, [1, 2, 3], null, undefined);
      }).not.toThrow();
    });
  });
});
