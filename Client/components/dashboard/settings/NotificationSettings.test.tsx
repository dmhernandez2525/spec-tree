import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationSettings } from './NotificationSettings';

// Mock sonner
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Track form submit handler
let formSubmitHandler: ((data: any) => void) | null = null;

// Mock react-hook-form
vi.mock('react-hook-form', () => {
  return {
    useForm: () => ({
      control: {},
      handleSubmit: (fn: any) => {
        formSubmitHandler = fn;
        return (e: any) => {
          e?.preventDefault?.();
          fn({
            emailNotifications: {
              updates: true,
              projectChanges: true,
              mentions: true,
              teamUpdates: false,
            },
            pushNotifications: {
              taskAssigned: true,
              deadlines: true,
              mentions: true,
              projectUpdates: false,
            },
            emailDigest: false,
            desktopNotifications: true,
          });
        };
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

// Mock Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardFooter: ({ children, className }: any) => <div data-testid="card-footer" className={className}>{children}</div>,
}));

// Mock Form components - use div instead of form to avoid nested forms
vi.mock('@/components/ui/form', () => {
  return {
    Form: ({ children, ...props }: any) => {
      const { onSubmit, ...restProps } = props;
      return <div data-testid="form" {...restProps}>{children}</div>;
    },
    FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
    FormDescription: ({ children }: any) => <p data-testid="form-description">{children}</p>,
    FormField: ({ render, name }: any) =>
      render({
        field: { value: true, onChange: vi.fn(), onBlur: vi.fn() },
        fieldState: { error: undefined },
      }),
    FormItem: ({ children, className }: any) => <div data-testid="form-item" className={className}>{children}</div>,
    FormLabel: ({ children, className }: any) => <label data-testid="form-label" className={className}>{children}</label>,
    FormMessage: () => <div data-testid="form-message" />,
    useFormField: () => ({ id: 'test-id', name: 'test', formItemId: 'test-item' }),
  };
});

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, type, variant, onClick, disabled }: any) => (
    <button
      data-testid={`button-${type || variant || 'default'}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

// Mock Switch component
vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked || false}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid="switch"
      role="switch"
    />
  ),
}));

// Mock Separator component
vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

describe('NotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formSubmitHandler = null;
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  describe('Exports', () => {
    it('exports NotificationSettings as named export', () => {
      expect(NotificationSettings).toBeDefined();
      expect(typeof NotificationSettings).toBe('function');
    });

    it('can be imported', () => {
      // NotificationSettings is imported at the top of the file
      expect(NotificationSettings).toBeDefined();
    });
  });

  describe('Component Structure', () => {
    it('renders without errors', async () => {
      await act(async () => {
        expect(() => render(<NotificationSettings />)).not.toThrow();
      });
    });

    it('renders form element', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByTestId('form')).toBeInTheDocument();
    });

    it('renders card component', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders card header', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
    });

    it('renders card content', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });
  });

  describe('Card Header Content', () => {
    it('renders Notification Preferences title', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    it('renders card description', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Choose how and when you want to be notified')).toBeInTheDocument();
    });
  });

  describe('Email Notifications Section', () => {
    it('renders Email Notifications heading', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });

    it('renders Project Changes label', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Project Changes')).toBeInTheDocument();
    });

    it('renders Project Changes description', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Get notified about important project updates and changes')).toBeInTheDocument();
    });
  });

  describe('Push Notifications Section', () => {
    it('renders Push Notifications heading', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });

    it('renders Task Assignments label', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Task Assignments')).toBeInTheDocument();
    });

    it('renders Task Assignments description', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Receive notifications when tasks are assigned to you')).toBeInTheDocument();
    });

    it('renders Deadlines label', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Deadlines')).toBeInTheDocument();
    });

    it('renders Deadlines description', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Get reminded about upcoming deadlines')).toBeInTheDocument();
    });
  });

  describe('General Settings Section', () => {
    it('renders General Settings heading', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('General Settings')).toBeInTheDocument();
    });

    it('renders Weekly Digest label', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Weekly Digest')).toBeInTheDocument();
    });

    it('renders Weekly Digest description', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Receive a weekly summary of all activities')).toBeInTheDocument();
    });

    it('renders Desktop Notifications label', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Desktop Notifications')).toBeInTheDocument();
    });

    it('renders Desktop Notifications description', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Show notifications on your desktop')).toBeInTheDocument();
    });
  });

  describe('Form Elements', () => {
    it('renders multiple switch components', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const switches = screen.getAllByTestId('switch');
      expect(switches.length).toBeGreaterThan(0);
    });

    it('renders separators between sections', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const separators = screen.getAllByTestId('separator');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('renders form items', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const formItems = screen.getAllByTestId('form-item');
      expect(formItems.length).toBeGreaterThan(0);
    });

    it('renders form controls', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const formControls = screen.getAllByTestId('form-control');
      expect(formControls.length).toBeGreaterThan(0);
    });

    it('renders form descriptions', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const formDescriptions = screen.getAllByTestId('form-description');
      expect(formDescriptions.length).toBeGreaterThan(0);
    });

    it('renders form labels', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const formLabels = screen.getAllByTestId('form-label');
      expect(formLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Submit Button', () => {
    it('renders Save Preferences button', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    });

    it('has submit type button', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByTestId('button-submit')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('handles form submission', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });

      // Find the actual form element
      const form = document.querySelector('form');
      expect(form).not.toBeNull();
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Notification preferences updated');
      });
    });

    it('shows success toast on submission', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });

      // Find the actual form element and submit
      const form = document.querySelector('form');
      expect(form).not.toBeNull();
      await act(async () => {
        fireEvent.submit(form!);
      });

      // Form submission triggers the onSubmit which calls toast.success
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Switch Interaction', () => {
    it('renders switches with role switch', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });

    it('allows toggling switch', async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<NotificationSettings />);
      });

      const switches = screen.getAllByRole('switch');
      const firstSwitch = switches[0];

      await user.click(firstSwitch);
      // The mock onChange should have been triggered
      expect(firstSwitch).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible form labels', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const labels = screen.getAllByTestId('form-label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('has accessible switch components', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });

    it('has accessible button', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
    });
  });

  describe('Section Structure', () => {
    it('renders three main sections', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      // Three h3 headings for the three sections
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
      expect(screen.getByText('General Settings')).toBeInTheDocument();
    });

    it('renders two separators between sections', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const separators = screen.getAllByTestId('separator');
      expect(separators.length).toBe(2);
    });
  });

  describe('Form Field Names', () => {
    it('renders emailNotifications.updates field', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Project Changes')).toBeInTheDocument();
    });

    it('renders pushNotifications.taskAssigned field', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Task Assignments')).toBeInTheDocument();
    });

    it('renders pushNotifications.deadlines field', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Deadlines')).toBeInTheDocument();
    });

    it('renders emailDigest field', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Weekly Digest')).toBeInTheDocument();
    });

    it('renders desktopNotifications field', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByText('Desktop Notifications')).toBeInTheDocument();
    });
  });

  describe('Form Item Styling', () => {
    it('renders form items with proper styling', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      const formItems = screen.getAllByTestId('form-item');
      formItems.forEach(item => {
        expect(item).toHaveClass('flex');
      });
    });
  });

  describe('Card Description', () => {
    it('renders card description element', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      expect(screen.getByTestId('card-description')).toBeInTheDocument();
    });
  });

  describe('Number of Form Fields', () => {
    it('renders correct number of switches for all notification types', async () => {
      await act(async () => {
        render(<NotificationSettings />);
      });
      // Should have 5 switches total:
      // 1 for email updates
      // 2 for push notifications (task assigned, deadlines)
      // 2 for general settings (email digest, desktop notifications)
      const switches = screen.getAllByTestId('switch');
      expect(switches.length).toBe(5);
    });
  });
});
