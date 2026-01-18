import { describe, it, expect, vi } from 'vitest';

// Mock react-redux
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(() => vi.fn()),
  useSelector: vi.fn((selector) => selector({ test: 'state' })),
}));

import { useAppDispatch, useAppSelector } from './use-store';

describe('use-store', () => {
  describe('useAppDispatch', () => {
    it('returns a dispatch function', () => {
      const dispatch = useAppDispatch();
      expect(typeof dispatch).toBe('function');
    });

    it('can be called', () => {
      const dispatch = useAppDispatch();
      expect(() => dispatch({ type: 'TEST' })).not.toThrow();
    });
  });

  describe('useAppSelector', () => {
    it('returns state from selector', () => {
      const result = useAppSelector((state) => state);
      expect(result).toEqual({ test: 'state' });
    });

    it('can select nested state', () => {
      const result = useAppSelector((state) => (state as any).test);
      expect(result).toBe('state');
    });
  });
});
