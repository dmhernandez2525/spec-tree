import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock askQuestion function
const mockAskQuestion = vi.fn();

// Mock all dependencies first
vi.mock('react-redux', () => ({
  useSelector: vi.fn((selector) => {
    const mockState = {
      sow: {
        selectedModel: 'gpt-4',
        chatApi: 'https://api.example.com',
      },
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

vi.mock('../../../../lib/store', () => ({
  RootState: {},
}));

vi.mock('../../../../lib/store/sow-slice', () => ({
  selectChatApi: vi.fn(() => 'https://api.example.com'),
}));

vi.mock('../../lib/api/openai', () => ({
  askQuestion: (params: unknown) => mockAskQuestion(params),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    className,
    ...props
  }: React.PropsWithChildren<{
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    className?: string;
  }>) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>) =>
    open ? (
      <div data-testid="dialog">
        <button data-testid="dialog-overlay" onClick={() => onOpenChange?.(false)}>
          Close Dialog
        </button>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: React.PropsWithChildren) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: React.PropsWithChildren) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogFooter: ({ children }: React.PropsWithChildren) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({
    value,
    onChange,
    placeholder,
    disabled,
    className,
    ...props
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
  }) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      data-testid="chat-textarea"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: React.PropsWithChildren<{ variant?: string }>) => (
    <div role="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: React.PropsWithChildren) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid="response-card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => (
    <span data-testid="loader" className={className}>
      Loading...
    </span>
  ),
}));

// Import after mocks
import Chat from './chat';
import { askQuestion as _askQuestion } from '../../lib/api/openai';

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAskQuestion.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'Test response from AI',
            },
          },
        ],
      },
    });
  });

  describe('Module Exports', () => {
    it('module can be imported', () => {
      // Chat is imported at the top of the file as default export
      expect(Chat).toBeDefined();
    });

    it('exports a default component', () => {
      // Chat is imported at the top as default export
      expect(typeof Chat).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders the Open Chat button', () => {
      render(<Chat />);

      expect(screen.getByText('Open Chat')).toBeInTheDocument();
    });

    it('button has outline variant', () => {
      render(<Chat />);

      const button = screen.getByText('Open Chat').closest('button');
      expect(button).toHaveAttribute('data-variant', 'outline');
    });

    it('button has full width class', () => {
      render(<Chat />);

      const button = screen.getByText('Open Chat').closest('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Dialog Opening', () => {
    it('opens dialog when Open Chat button is clicked', () => {
      render(<Chat />);

      const openButton = screen.getByText('Open Chat');
      fireEvent.click(openButton);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('displays dialog title "AI Assistant Chat"', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      expect(screen.getByText('AI Assistant Chat')).toBeInTheDocument();
    });

    it('renders dialog header', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    });

    it('renders dialog content', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    it('renders dialog footer', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
    });
  });

  describe('Textarea', () => {
    it('renders textarea in dialog', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      expect(screen.getByTestId('chat-textarea')).toBeInTheDocument();
    });

    it('textarea has placeholder text', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Type your question here...');
    });

    it('textarea updates value on change', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      expect(textarea).toHaveValue('Test question');
    });

    it('textarea is disabled while loading', async () => {
      mockAskQuestion.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByTestId('chat-textarea')).toBeDisabled();
      });
    });
  });

  describe('Ask Question Button', () => {
    it('has a disabled Ask Question button when textarea is empty', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const askButton = screen.getByText('Ask Question');
      expect(askButton.closest('button')).toBeDisabled();
    });

    it('has a disabled Ask Question button when textarea has only whitespace', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: '   ' } });

      const askButton = screen.getByText('Ask Question');
      expect(askButton.closest('button')).toBeDisabled();
    });

    it('enables Ask Question button when textarea has content', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      expect(askButton.closest('button')).not.toBeDisabled();
    });

    it('button is disabled while loading', async () => {
      mockAskQuestion.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('Processing...').closest('button')).toBeDisabled();
      });
    });
  });

  describe('Asking Questions', () => {
    it('calls askQuestion API when Ask Question button is clicked', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'What is React?' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(mockAskQuestion).toHaveBeenCalledWith({
          question: 'What is React?',
          selectedModel: 'gpt-4',
          chatApi: 'https://api.example.com',
        });
      });
    });

    it('does not call askQuestion when question is empty', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      expect(mockAskQuestion).not.toHaveBeenCalled();
    });

    it('displays response from API', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('Test response from AI')).toBeInTheDocument();
      });
    });

    it('displays response in a card', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByTestId('response-card')).toBeInTheDocument();
      });
    });

    it('displays response in scroll area', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loader icon while processing', async () => {
      mockAskQuestion.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByTestId('loader')).toBeInTheDocument();
      });
    });

    it('shows "Processing..." text while loading', async () => {
      mockAskQuestion.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });
    });

    it('hides loader after response is received', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      });
    });

    it('button text returns to "Ask Question" after loading', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('Ask Question')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      mockAskQuestion.mockRejectedValueOnce(new Error('API Error'));

      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText('Failed to get response. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('error alert has destructive variant', async () => {
      mockAskQuestion.mockRejectedValueOnce(new Error('API Error'));

      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('data-variant', 'destructive');
      });
    });

    it('clears error when new question is asked successfully', async () => {
      // First call fails
      mockAskQuestion.mockRejectedValueOnce(new Error('API Error'));

      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Second call succeeds
      mockAskQuestion.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'Success response' } }],
        },
      });

      fireEvent.change(textarea, { target: { value: 'New question' } });
      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('Success response')).toBeInTheDocument();
      });
    });

    it('stops loading state when API call fails', async () => {
      mockAskQuestion.mockRejectedValueOnce(new Error('API Error'));

      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      const askButton = screen.getByText('Ask Question');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        expect(screen.getByText('Ask Question')).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Closing', () => {
    it('can close dialog via overlay', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));
      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      const overlay = screen.getByTestId('dialog-overlay');
      fireEvent.click(overlay);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('preserves state when dialog is reopened', async () => {
      render(<Chat />);

      // Open dialog and get a response
      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });

      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        expect(screen.getByText('Test response from AI')).toBeInTheDocument();
      });

      // Close dialog
      fireEvent.click(screen.getByTestId('dialog-overlay'));
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();

      // Reopen dialog
      fireEvent.click(screen.getByText('Open Chat'));

      // Response should still be visible
      expect(screen.getByText('Test response from AI')).toBeInTheDocument();
    });
  });

  describe('Multiple Questions', () => {
    it('can ask multiple questions', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      // First question
      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'First question' } });
      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        expect(screen.getByText('Test response from AI')).toBeInTheDocument();
      });

      // Second question
      mockAskQuestion.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'Second response' } }],
        },
      });

      fireEvent.change(textarea, { target: { value: 'Second question' } });
      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        expect(screen.getByText('Second response')).toBeInTheDocument();
      });
    });

    it('updates response when new question is asked', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      // First question
      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'First question' } });
      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        expect(screen.getByText('Test response from AI')).toBeInTheDocument();
      });

      // Second question with different response
      mockAskQuestion.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'Different response' } }],
        },
      });

      fireEvent.change(textarea, { target: { value: 'Second question' } });
      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        expect(screen.getByText('Different response')).toBeInTheDocument();
        // Old response should be replaced
        expect(screen.queryByText('Test response from AI')).not.toBeInTheDocument();
      });
    });
  });

  describe('Props', () => {
    it('accepts onClose prop', () => {
      const onClose = vi.fn();
      render(<Chat onClose={onClose} />);

      // Component renders without error
      expect(screen.getByText('Open Chat')).toBeInTheDocument();
    });
  });

  describe('Response Display', () => {
    it('does not display response card when there is no response', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      // Initially no response card
      expect(screen.queryByTestId('response-card')).not.toBeInTheDocument();
    });

    it('displays response in prose styled div', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test question' } });
      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        const cardContent = screen.getByTestId('card-content');
        expect(cardContent).toBeInTheDocument();
      });
    });
  });

  describe('UI Layout', () => {
    it('renders scroll area for response', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });

    it('textarea has minimum height', () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      expect(textarea).toHaveClass('min-h-[100px]');
    });
  });

  describe('Integration with Redux', () => {
    it('uses selectedModel from Redux state', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test' } });
      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        expect(mockAskQuestion).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedModel: 'gpt-4',
          })
        );
      });
    });

    it('uses chatApi from Redux selector', async () => {
      render(<Chat />);

      fireEvent.click(screen.getByText('Open Chat'));

      const textarea = screen.getByTestId('chat-textarea');
      fireEvent.change(textarea, { target: { value: 'Test' } });
      fireEvent.click(screen.getByText('Ask Question'));

      await waitFor(() => {
        expect(mockAskQuestion).toHaveBeenCalledWith(
          expect.objectContaining({
            chatApi: 'https://api.example.com',
          })
        );
      });
    });
  });
});
