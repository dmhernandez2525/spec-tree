import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('class1', 'class2');

    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');

    expect(result).toBe('base active');
  });

  it('handles false conditionals', () => {
    const isActive = false;
    const result = cn('base', isActive && 'active');

    expect(result).toBe('base');
  });

  it('handles array of classes', () => {
    const result = cn(['class1', 'class2']);

    expect(result).toBe('class1 class2');
  });

  it('handles object syntax', () => {
    const result = cn({ active: true, disabled: false });

    expect(result).toBe('active');
  });

  it('merges conflicting tailwind classes', () => {
    const result = cn('p-4', 'p-8');

    expect(result).toBe('p-8');
  });

  it('merges tailwind variants correctly', () => {
    const result = cn('bg-red-500', 'hover:bg-blue-500', 'bg-green-500');

    expect(result).toBe('hover:bg-blue-500 bg-green-500');
  });

  it('handles undefined values', () => {
    const result = cn('base', undefined, 'end');

    expect(result).toBe('base end');
  });

  it('handles null values', () => {
    const result = cn('base', null, 'end');

    expect(result).toBe('base end');
  });

  it('handles empty string', () => {
    const result = cn('base', '', 'end');

    expect(result).toBe('base end');
  });

  it('handles no arguments', () => {
    const result = cn();

    expect(result).toBe('');
  });

  it('handles complex nested conditions', () => {
    const variant = 'primary';
    const size = 'lg';
    const result = cn(
      'btn',
      {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
      },
      size === 'lg' && 'btn-lg'
    );

    expect(result).toBe('btn btn-primary btn-lg');
  });
});
