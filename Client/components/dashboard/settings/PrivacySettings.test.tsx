import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { PrivacySettings } from './PrivacySettings';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock react-hook-form to avoid concurrent mode issues
vi.mock('react-hook-form', () => {
  const React = require('react');
  return {
    useForm: () => ({
      control: {},
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.();
        fn({});
      },
      formState: { errors: {} },
      watch: vi.fn(),
      setValue: vi.fn(),
      getValues: vi.fn(() => ({})),
      reset: vi.fn(),
    }),
    Controller: ({ render }: any) =>
      render({
        field: { value: '', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() },
        fieldState: { error: undefined },
      }),
    FormProvider: ({ children }: any) => children,
    useFormContext: () => ({
      control: {},
      formState: { errors: {} },
    }),
  };
});

// Mock @hookform/resolvers/zod
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => vi.fn()),
}));

// Mock Form components
vi.mock('@/components/ui/form', () => {
  const React = require('react');
  return {
    Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    FormControl: ({ children }: any) => <div>{children}</div>,
    FormDescription: ({ children }: any) => <p>{children}</p>,
    FormField: ({ render }: any) =>
      render({
        field: { value: 'team', onChange: vi.fn(), onBlur: vi.fn() },
        fieldState: { error: undefined },
      }),
    FormItem: ({ children, className }: any) => <div className={className}>{children}</div>,
    FormLabel: ({ children, className }: any) => <label className={className}>{children}</label>,
    FormMessage: () => null,
    useFormField: () => ({ id: 'test-id', name: 'test', formItemId: 'test-item' }),
  };
});

// Mock Select component
vi.mock('@/components/ui/select', () => {
  const React = require('react');
  return {
    Select: ({ children, onValueChange, defaultValue }: any) => (
      <div data-testid="select">{children}</div>
    ),
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: any) => <button type="button">{children}</button>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder || 'Select'}</span>,
  };
});

// Mock Switch component
vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked || false}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid="switch"
    />
  ),
}));

describe('PrivacySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  describe('Exports', () => {
    it('exports PrivacySettings as named export', () => {
      expect(PrivacySettings).toBeDefined();
      expect(typeof PrivacySettings).toBe('function');
    });
  });

  describe('Component Import', () => {
    it('imports without errors', async () => {
      await act(async () => {
        expect(() => {
          render(<PrivacySettings />);
        }).not.toThrow();
      });
    });
  });

  describe('Rendering', () => {
    it('renders card title', async () => {
      await act(async () => {
        render(<PrivacySettings />);
      });
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    it('renders card description', async () => {
      await act(async () => {
        render(<PrivacySettings />);
      });
      expect(
        screen.getByText('Manage how your information is displayed and used')
      ).toBeInTheDocument();
    });

    it('renders submit button', async () => {
      await act(async () => {
        render(<PrivacySettings />);
      });
      expect(
        screen.getByRole('button', { name: /Save Privacy Settings/i })
      ).toBeInTheDocument();
    });
  });
});
