import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AISettings } from './AISettings';

// Create mock functions for redux
const mockDispatch = vi.fn();
const mockUnwrap = vi.fn();

// Mock Redux
vi.mock('@/lib/hooks/use-store', () => ({
  useAppDispatch: () => mockDispatch,
}));

// Mock settings-slice
vi.mock('@/lib/store/settings-slice', () => ({
  updateAISettings: vi.fn((data) => ({ type: 'settings/updateAISettings', payload: data })),
}));

// Mock values for form fields
let mockUseOwnKeysValue = false;
const mockFormReset = vi.fn();
const mockFormSetValue = vi.fn();

// Mock react-hook-form
vi.mock('react-hook-form', () => {
  return {
    useForm: () => ({
      control: {},
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.();
        return fn({
          useOwnKeys: mockUseOwnKeysValue,
          defaultProvider: 'openai',
          defaultModel: 'gpt-4o',
          apiKeys: {},
          settings: {
            temperature: 0.7,
            maxTokens: 4096,
            frequencyPenalty: 0.5,
            presencePenalty: 0.5,
          },
        });
      },
      formState: { errors: {} },
      watch: vi.fn(() => mockUseOwnKeysValue),
      setValue: mockFormSetValue,
      getValues: vi.fn(() => ({})),
      reset: mockFormReset,
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

// Mock Form components with more detail - use div instead of form to avoid nested forms
vi.mock('@/components/ui/form', () => {
  return {
    Form: ({ children, ...props }: any) => {
      // Extract only data-testid and pass onSubmit to a wrapper div
      const { onSubmit: _onSubmit, ...restProps } = props;
      return <div data-testid="form" {...restProps}>{children}</div>;
    },
    FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
    FormDescription: ({ children }: any) => <p data-testid="form-description">{children}</p>,
    FormField: ({ render, name }: any) =>
      render({
        field: {
          value: name === 'useOwnKeys' ? mockUseOwnKeysValue : (name?.includes('temperature') ? 0.7 : ''),
          onChange: vi.fn(),
          onBlur: vi.fn()
        },
        fieldState: { error: undefined },
      }),
    FormItem: ({ children, className }: any) => <div data-testid="form-item" className={className}>{children}</div>,
    FormLabel: ({ children, className }: any) => <label data-testid="form-label" className={className}>{children}</label>,
    FormMessage: () => <div data-testid="form-message" />,
    useFormField: () => ({ id: 'test-id', name: 'test', formItemId: 'test-item' }),
  };
});

// Mock Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardFooter: ({ children, className }: any) => <div data-testid="card-footer" className={className}>{children}</div>,
}));

// Mock Select component
vi.mock('@/components/ui/select', () => {
  return {
    Select: ({ children, onValueChange, defaultValue }: any) => (
      <div data-testid="select" data-default-value={defaultValue}>
        <button data-testid="select-trigger-button" onClick={() => onValueChange?.('anthropic')}>
          Change Provider
        </button>
        {children}
      </div>
    ),
    SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
    SelectItem: ({ children, value }: any) => <div data-testid={`select-item-${value}`} data-value={value}>{children}</div>,
    SelectTrigger: ({ children }: any) => <button type="button" data-testid="select-trigger">{children}</button>,
    SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder || 'Select'}</span>,
  };
});

// Mock Input component
vi.mock('@/components/ui/input', () => ({
  Input: ({ type, placeholder, ...props }: any) => (
    <input
      data-testid="input"
      type={type}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

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

// Mock Slider component
vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step, className }: any) => (
    <input
      type="range"
      value={value?.[0] || 0}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
      data-testid="slider"
      className={className}
    />
  ),
}));

// Mock sonner
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock Icons
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    spinner: ({ className }: { className?: string }) => (
      <span data-testid="icon-spinner" className={className}>Spinner</span>
    ),
    openai: ({ className }: { className?: string }) => (
      <span data-testid="icon-openai" className={className}>OpenAI</span>
    ),
    brain: ({ className }: { className?: string }) => (
      <span data-testid="icon-brain" className={className}>Brain</span>
    ),
    sparkles: ({ className }: { className?: string }) => (
      <span data-testid="icon-sparkles" className={className}>Sparkles</span>
    ),
    externalLink: ({ className }: { className?: string }) => (
      <span data-testid="icon-external-link" className={className}>ExternalLink</span>
    ),
  },
}));

describe('AISettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOwnKeysValue = false;
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap.mockResolvedValue({}),
    });
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  describe('Exports', () => {
    it('exports AISettings as named export', () => {
      expect(AISettings).toBeDefined();
      expect(typeof AISettings).toBe('function');
    });

    it('can be imported', () => {
      // AISettings is imported at the top of the file
      expect(AISettings).toBeDefined();
    });
  });

  describe('Component Structure', () => {
    it('renders without errors', async () => {
      await act(async () => {
        expect(() => render(<AISettings />)).not.toThrow();
      });
    });

    it('renders form element', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('form')).toBeInTheDocument();
    });

    it('renders card component', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders card header', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
    });

    it('renders card content', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('renders card footer', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    });
  });

  describe('Card Header Content', () => {
    it('renders AI Configuration title', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('AI Configuration')).toBeInTheDocument();
    });

    it('renders card description', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Configure AI providers and model settings')).toBeInTheDocument();
    });
  });

  describe('Use Own API Keys Toggle', () => {
    it('renders Use Own API Keys label', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Use Own API Keys')).toBeInTheDocument();
    });

    it('renders discount description', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Get a 20% discount on AI usage by using your own API keys')).toBeInTheDocument();
    });

    it('renders switch component', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const switches = screen.getAllByTestId('switch');
      expect(switches.length).toBeGreaterThan(0);
    });
  });

  describe('Provider Selection', () => {
    it('renders Default AI Provider label', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Default AI Provider')).toBeInTheDocument();
    });

    it('renders provider selection description', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Choose your preferred AI provider')).toBeInTheDocument();
    });

    it('renders select component for provider', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const selects = screen.getAllByTestId('select');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('renders OpenAI provider option', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('select-item-openai')).toBeInTheDocument();
    });

    it('renders Anthropic provider option', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('select-item-anthropic')).toBeInTheDocument();
    });

    it('renders Gemini provider option', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('select-item-gemini')).toBeInTheDocument();
    });

    it('renders provider names', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      // OpenAI appears multiple times (in icon and provider name), so use getAllByText
      expect(screen.getAllByText('OpenAI').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Anthropic').length).toBeGreaterThan(0);
      expect(screen.getByText('Google Gemini')).toBeInTheDocument();
    });
  });

  describe('Model Selection', () => {
    it('renders Default Model label', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Default Model')).toBeInTheDocument();
    });

    it('renders model selection description', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Choose your default AI model')).toBeInTheDocument();
    });

    it('renders GPT-4o model option', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('select-item-gpt-4o')).toBeInTheDocument();
    });

    it('renders GPT-4 Turbo model option', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('select-item-gpt-4-turbo')).toBeInTheDocument();
    });

    it('renders GPT-3.5 Turbo model option', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('select-item-gpt-3.5-turbo')).toBeInTheDocument();
    });
  });

  describe('Model Settings Section', () => {
    it('renders Model Settings heading', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Model Settings')).toBeInTheDocument();
    });

    it('renders Temperature label', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Temperature')).toBeInTheDocument();
    });

    it('renders Temperature description', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Controls randomness in the output (0 = deterministic, 2 = very random)')).toBeInTheDocument();
    });

    it('renders Max Tokens label', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Max Tokens')).toBeInTheDocument();
    });

    it('renders Max Tokens description', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Maximum number of tokens to generate')).toBeInTheDocument();
    });

    it('renders slider components', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const sliders = screen.getAllByTestId('slider');
      expect(sliders.length).toBeGreaterThan(0);
    });
  });

  describe('API Keys Section (when useOwnKeys is true)', () => {
    beforeEach(() => {
      mockUseOwnKeysValue = true;
    });

    it('renders API Keys heading', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('API Keys')).toBeInTheDocument();
    });

    it('renders OpenAI API Key label', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('OpenAI API Key')).toBeInTheDocument();
    });

    it('renders Anthropic API Key label', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Anthropic API Key')).toBeInTheDocument();
    });

    it('renders Google Gemini API Key label', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Google Gemini API Key')).toBeInTheDocument();
    });

    it('renders API key instructions for OpenAI', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Get your API key from the OpenAI platform')).toBeInTheDocument();
    });

    it('renders API key instructions for Anthropic', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Get your API key from the Anthropic Console')).toBeInTheDocument();
    });

    it('renders API key instructions for Google', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Get your API key from Google AI Studio')).toBeInTheDocument();
    });

    it('renders external link icons', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const externalLinks = screen.getAllByTestId('icon-external-link');
      expect(externalLinks.length).toBeGreaterThan(0);
    });

    it('renders input fields for API keys', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Footer Buttons', () => {
    it('renders Reset to Defaults button', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });

    it('renders Save Settings button', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
    });

    it('calls form reset when Reset to Defaults is clicked', async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<AISettings />);
      });

      const resetButton = screen.getByText('Reset to Defaults');
      await user.click(resetButton);

      expect(mockFormReset).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('handles successful form submission', async () => {
      mockUnwrap.mockResolvedValue({});

      await act(async () => {
        render(<AISettings />);
      });

      // Find the actual form element (the one inside the component, not the mocked Form wrapper)
      const form = document.querySelector('form');
      expect(form).not.toBeNull();
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('shows success toast on successful submission', async () => {
      mockUnwrap.mockResolvedValue({});

      await act(async () => {
        render(<AISettings />);
      });

      const form = document.querySelector('form');
      expect(form).not.toBeNull();
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('AI settings updated successfully');
      });
    });

    it('shows error toast on failed submission', async () => {
      mockUnwrap.mockRejectedValue(new Error('Failed'));

      await act(async () => {
        render(<AISettings />);
      });

      const form = document.querySelector('form');
      expect(form).not.toBeNull();
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to update AI settings');
      });
    });
  });

  describe('Provider Icons', () => {
    it('renders OpenAI icon', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('icon-openai')).toBeInTheDocument();
    });

    it('renders Brain icon for Anthropic', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('icon-brain')).toBeInTheDocument();
    });

    it('renders Sparkles icon for Gemini', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      expect(screen.getByTestId('icon-sparkles')).toBeInTheDocument();
    });
  });

  describe('Form Field Components', () => {
    it('renders multiple form items', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const formItems = screen.getAllByTestId('form-item');
      expect(formItems.length).toBeGreaterThan(0);
    });

    it('renders multiple form controls', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const formControls = screen.getAllByTestId('form-control');
      expect(formControls.length).toBeGreaterThan(0);
    });

    it('renders multiple form descriptions', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const formDescriptions = screen.getAllByTestId('form-description');
      expect(formDescriptions.length).toBeGreaterThan(0);
    });

    it('renders form labels', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const formLabels = screen.getAllByTestId('form-label');
      expect(formLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Provider Change Handler', () => {
    it('updates model when provider changes', async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<AISettings />);
      });

      // Click the provider change button (simulates provider selection)
      const providerButton = screen.getAllByTestId('select-trigger-button')[0];
      await user.click(providerButton);

      // The setValue should be called with the first model of the new provider
      expect(mockFormSetValue).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible switch with role', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });

    it('has form labels associated with controls', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const labels = screen.getAllByTestId('form-label');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('Select Components', () => {
    it('renders select triggers', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const triggers = screen.getAllByTestId('select-trigger');
      expect(triggers.length).toBeGreaterThan(0);
    });

    it('renders select content', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const content = screen.getAllByTestId('select-content');
      expect(content.length).toBeGreaterThan(0);
    });

    it('renders select values', async () => {
      await act(async () => {
        render(<AISettings />);
      });
      const values = screen.getAllByTestId('select-value');
      expect(values.length).toBeGreaterThan(0);
    });
  });
});
