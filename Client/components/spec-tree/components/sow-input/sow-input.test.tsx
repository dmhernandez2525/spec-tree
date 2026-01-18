import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock all dependencies first
const mockDispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(() => mockDispatch),
}));

vi.mock('../../../../lib/store/sow-slice', () => ({
  setSow: vi.fn((sow) => ({ type: 'SET_SOW', payload: sow })),
}));

vi.mock('../../lib/api/strapi-service', () => ({
  strapiService: {
    fetchAppById: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    ...props
  }: React.PropsWithChildren<{
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
  }>) => (
    <button onClick={onClick} disabled={disabled} type={type as 'button' | 'submit'} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({
    value,
    onChange,
    placeholder,
    disabled,
    ...props
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="sow-textarea"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  AccordionContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  AccordionItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  AccordionTrigger: ({ children }: React.PropsWithChildren) => <button>{children}</button>,
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: React.PropsWithChildren) => <div role="alert">{children}</div>,
  AlertDescription: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <span data-testid="loader">Loading...</span>,
  Upload: () => <span data-testid="upload-icon">Upload</span>,
}));

// Import after mocks
import SowInput from './sow-input';
import { setSow } from '../../../../lib/store/sow-slice';
import { strapiService } from '../../lib/api/strapi-service';

describe('SowInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('module can be imported', () => {
    // SowInput is imported at the top of the file
    expect(SowInput).toBeDefined();
  });

  it('exports a default component', () => {
    // SowInput is imported at the top as default export
    expect(typeof SowInput).toBe('function');
  });

  it('renders the Import Statement of Work accordion trigger', () => {
    render(<SowInput selectedApp={null} />);

    expect(screen.getByText('Import Statement of Work')).toBeInTheDocument();
  });

  it('renders textarea with placeholder', () => {
    render(<SowInput selectedApp={null} />);

    const textarea = screen.getByTestId('sow-textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Paste your SOW JSON here...');
  });

  it('renders Import SOW button', () => {
    render(<SowInput selectedApp={null} />);

    expect(screen.getByText('Import SOW')).toBeInTheDocument();
  });

  it('has disabled Import button when textarea is empty', () => {
    render(<SowInput selectedApp={null} />);

    const importButton = screen.getByText('Import SOW').closest('button');
    expect(importButton).toBeDisabled();
  });

  it('enables Import button when textarea has content', () => {
    render(<SowInput selectedApp={null} />);

    const textarea = screen.getByTestId('sow-textarea');
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } });

    const importButton = screen.getByText('Import SOW').closest('button');
    expect(importButton).not.toBeDisabled();
  });

  it('shows error for invalid JSON', async () => {
    render(<SowInput selectedApp={null} />);

    const textarea = screen.getByTestId('sow-textarea');
    fireEvent.change(textarea, { target: { value: 'invalid json' } });

    const form = screen.getByTestId('sow-textarea').closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Invalid JSON format. Please check your input.')).toBeInTheDocument();
    });
  });

  it('dispatches setSow for valid JSON', async () => {
    render(<SowInput selectedApp={null} />);

    const textarea = screen.getByTestId('sow-textarea');
    const validJson = '{"epics": [], "features": []}';
    fireEvent.change(textarea, { target: { value: validJson } });

    const form = screen.getByTestId('sow-textarea').closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(setSow).toHaveBeenCalledWith({ epics: [], features: [] });
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it('fetches app data when selectedApp is provided', async () => {
    render(<SowInput selectedApp="app-123" />);

    await waitFor(() => {
      expect(strapiService.fetchAppById).toHaveBeenCalledWith('app-123');
    });
  });
});
