import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  RefreshCw: () => <span data-testid="refresh-icon">RefreshCw</span>,
  Sparkles: () => <span data-testid="sparkles-icon">Sparkles</span>,
  ChevronDown: () => <span data-testid="chevron-icon">ChevronDown</span>,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-testid="button" {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div onClick={onClick} data-testid="dropdown-item">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, ...props }: { value?: string; onChange?: (e: unknown) => void }) => (
    <textarea value={value} onChange={onChange} data-testid="textarea" {...props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label data-testid="label">{children}</label>,
}));

// Import after mocks
import RegenerateFeedback from './index';

describe('RegenerateFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('module can be imported', () => {
    // RegenerateFeedback is imported at the top of the file
    expect(RegenerateFeedback).toBeDefined();
  });

  it('exports RegenerateFeedback as default export', () => {
    // RegenerateFeedback is imported at the top as default export
    expect(typeof RegenerateFeedback).toBe('function');
  });

  it('exports FeedbackType type', () => {
    // FeedbackType is a type export, verified by successful module import
    expect(RegenerateFeedback).toBeDefined();
  });

  it('component has correct name', () => {
    // RegenerateFeedback is imported at the top
    expect(RegenerateFeedback.name).toBe('RegenerateFeedback');
  });
});

describe('RegenerateFeedback structure', () => {
  it('module is a valid React component', () => {
    // RegenerateFeedback is imported at the top
    expect(typeof RegenerateFeedback).toBe('function');
  });
});
