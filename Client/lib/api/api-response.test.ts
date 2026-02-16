import { describe, it, expect } from 'vitest';
import { parsePagination, parseSort } from './api-response';

describe('api-response', () => {
  describe('parsePagination', () => {
    it('returns defaults when no params provided', () => {
      const params = new URLSearchParams();
      const result = parsePagination(params);
      expect(result).toEqual({ page: 1, pageSize: 25 });
    });

    it('parses page and pageSize', () => {
      const params = new URLSearchParams({ page: '3', pageSize: '50' });
      const result = parsePagination(params);
      expect(result).toEqual({ page: 3, pageSize: 50 });
    });

    it('clamps page to minimum 1', () => {
      const params = new URLSearchParams({ page: '-5' });
      const result = parsePagination(params);
      expect(result.page).toBe(1);
    });

    it('clamps pageSize to maximum 100', () => {
      const params = new URLSearchParams({ pageSize: '500' });
      const result = parsePagination(params);
      expect(result.pageSize).toBe(100);
    });

    it('falls back to default for zero pageSize', () => {
      const params = new URLSearchParams({ pageSize: '0' });
      const result = parsePagination(params);
      expect(result.pageSize).toBe(25);
    });
  });

  describe('parseSort', () => {
    it('returns null when no sort param', () => {
      const params = new URLSearchParams();
      expect(parseSort(params, ['name'])).toBeNull();
    });

    it('parses valid sort field', () => {
      const params = new URLSearchParams({ sort: 'name:asc' });
      expect(parseSort(params, ['name', 'createdAt'])).toBe('name:asc');
    });

    it('defaults to asc when direction is missing', () => {
      const params = new URLSearchParams({ sort: 'name' });
      expect(parseSort(params, ['name'])).toBe('name:asc');
    });

    it('rejects fields not in the allowed list', () => {
      const params = new URLSearchParams({ sort: 'password:asc' });
      expect(parseSort(params, ['name', 'createdAt'])).toBeNull();
    });

    it('handles desc direction', () => {
      const params = new URLSearchParams({ sort: 'createdAt:desc' });
      expect(parseSort(params, ['createdAt'])).toBe('createdAt:desc');
    });
  });
});
