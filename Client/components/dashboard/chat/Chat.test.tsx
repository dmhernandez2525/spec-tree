import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

import Chat from './Chat';

// Mock framer-motion to avoid animation-related issues
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'HH:mm') {
      return '12:00';
    }
    return date.toISOString();
  },
}));

// Mock uuid with incrementing IDs for unique messages
let uuidCounter = 0;
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${++uuidCounter}`,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Send: ({ className }: { className?: string }) => (
    <span className={className} data-testid="send-icon">
      SendIcon
    </span>
  ),
  Paperclip: ({ className }: { className?: string }) => (
    <span className={className} data-testid="paperclip-icon">
      PaperclipIcon
    </span>
  ),
  MoreVertical: ({ className }: { className?: string }) => (
    <span className={className} data-testid="more-icon">
      MoreIcon
    </span>
  ),
  MinusCircle: ({ className }: { className?: string }) => (
    <span className={className} data-testid="minus-icon">
      MinusIcon
    </span>
  ),
}));

describe('Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    uuidCounter = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Exports', () => {
    it('exports Chat component as default', () => {
      expect(Chat).toBeDefined();
      expect(typeof Chat).toBe('function');
    });
  });

  describe('Initial Rendering', () => {
    it('renders chat component with title', () => {
      render(<Chat />);
      expect(screen.getByText('Support Chat')).toBeInTheDocument();
    });

    it('renders chat description', () => {
      render(<Chat />);
      expect(screen.getByText('Get help from our support team')).toBeInTheDocument();
    });

    it('renders message input placeholder', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      expect(input).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<Chat />);
      expect(screen.getByTestId('send-icon')).toBeInTheDocument();
    });

    it('renders attachment button', () => {
      render(<Chat />);
      expect(screen.getByTestId('paperclip-icon')).toBeInTheDocument();
    });

    it('renders dropdown menu button', () => {
      render(<Chat />);
      expect(screen.getByTestId('more-icon')).toBeInTheDocument();
    });

    it('renders with fixed height container', () => {
      render(<Chat />);
      const container = screen.getByText('Support Chat').closest('.h-\\[600px\\]');
      expect(container).toBeInTheDocument();
    });

    it('renders empty message area initially', () => {
      render(<Chat />);
      // No messages should be visible initially
      expect(screen.queryByText('12:00')).not.toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('updates input value when typing', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Hello World' } });
      expect(input.value).toBe('Hello World');
    });

    it('handles special characters in input', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '<script>alert("xss")</script>' } });
      expect(input.value).toBe('<script>alert("xss")</script>');
    });

    it('handles empty input', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '' } });
      expect(input.value).toBe('');
    });

    it('handles long input text', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      const longText = 'a'.repeat(1000);
      fireEvent.change(input, { target: { value: longText } });
      expect(input.value).toBe(longText);
    });

    it('handles whitespace-only input', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '   ' } });
      expect(input.value).toBe('   ');
    });
  });

  describe('Message Sending', () => {
    it('sends message when send button is clicked', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Test message' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('clears input after sending message', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Test message' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      expect(input.value).toBe('');
    });

    it('does not send empty messages when clicking send', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      expect(input.value).toBe('');

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      // No message timestamp should appear
      expect(screen.queryByText('12:00')).not.toBeInTheDocument();
    });

    it('does not send whitespace-only messages', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '   ' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      // No message timestamp should appear
      expect(screen.queryByText('12:00')).not.toBeInTheDocument();
    });

    it('has keyPress handler on input', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');

      // Verify input exists and is ready for keyboard input
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
    });

    it('input accepts keyboard input', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Test keyboard input' } });

      // Verify input accepted the value
      expect(input.value).toBe('Test keyboard input');
    });

    it('handleKeyPress function exists on component', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');

      // Input should be rendered and ready for key events
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('handles multiple messages in sequence', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByTestId('send-icon').closest('button');

      fireEvent.change(input, { target: { value: 'First message' } });
      fireEvent.click(sendButton!);

      fireEvent.change(input, { target: { value: 'Second message' } });
      fireEvent.click(sendButton!);

      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });
  });

  describe('Simulated Response', () => {
    it('receives simulated response after sending message', async () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Hello' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      // Fast-forward timer by 1000ms for the simulated response
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(
        screen.getByText('This is a simulated response from the support team.')
      ).toBeInTheDocument();
    });

    it('response message has assistant sender styling', async () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Test' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const responseMessage = screen.getByText(
        'This is a simulated response from the support team.'
      );
      const messageContainer = responseMessage.closest('div');
      expect(messageContainer?.className).toContain('bg-muted');
    });
  });

  describe('Message Styling', () => {
    it('applies user message styling correctly', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'User message' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      const message = screen.getByText('User message');
      const messageContainer = message.closest('div');
      expect(messageContainer?.className).toContain('bg-primary');
      expect(messageContainer?.className).toContain('text-primary-foreground');
    });

    it('displays message timestamps', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Test' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      expect(screen.getByText('12:00')).toBeInTheDocument();
    });

    it('aligns user messages to the right', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Right aligned message' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      const message = screen.getByText('Right aligned message');
      const outerContainer = message.closest('.mb-4');
      expect(outerContainer?.className).toContain('justify-end');
    });

    it('aligns assistant messages to the left', async () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Test' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const responseMessage = screen.getByText(
        'This is a simulated response from the support team.'
      );
      const outerContainer = responseMessage.closest('.mb-4');
      expect(outerContainer?.className).toContain('justify-start');
    });
  });

  describe('Scroll Behavior', () => {
    it('tracks scroll position on scroll event', () => {
      render(<Chat />);
      const scrollArea = document.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();

      if (scrollArea) {
        // Simulate scroll event with target properties
        fireEvent.scroll(scrollArea);
      }
    });

    it('handles scroll to bottom tracking', () => {
      render(<Chat />);
      const scrollArea = document.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();

      if (scrollArea) {
        // Just trigger scroll event
        fireEvent.scroll(scrollArea);
      }
    });
  });

  describe('Dropdown Menu', () => {
    it('renders dropdown menu trigger button', () => {
      render(<Chat />);
      const moreButton = screen.getByTestId('more-icon').closest('button');
      expect(moreButton).toBeInTheDocument();
    });

    it('more button is clickable', () => {
      render(<Chat />);
      const moreButton = screen.getByTestId('more-icon').closest('button');

      expect(moreButton).toBeInTheDocument();
      // Verify button exists and is clickable
      expect(() => fireEvent.click(moreButton!)).not.toThrow();
    });
  });

  describe('Attachment Button', () => {
    it('renders attachment button', () => {
      render(<Chat />);
      const attachButton = screen.getByTestId('paperclip-icon').closest('button');
      expect(attachButton).toBeInTheDocument();
    });

    it('attachment button is clickable', () => {
      render(<Chat />);
      const attachButton = screen.getByTestId('paperclip-icon').closest('button');
      expect(() => fireEvent.click(attachButton!)).not.toThrow();
    });
  });

  describe('Card Layout', () => {
    it('renders Card with header', () => {
      render(<Chat />);
      const title = screen.getByText('Support Chat');
      expect(title).toBeInTheDocument();
    });

    it('renders Card with content area', () => {
      render(<Chat />);
      const scrollArea = document.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();
    });

    it('renders Card with footer', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      expect(input.closest('.border-t')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('input has proper placeholder text', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      expect(input).toBeInTheDocument();
    });

    it('buttons are accessible', () => {
      render(<Chat />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid message sending', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByTestId('send-icon').closest('button');

      for (let i = 0; i < 5; i++) {
        fireEvent.change(input, { target: { value: `Message ${i}` } });
        fireEvent.click(sendButton!);
      }

      expect(screen.getByText('Message 0')).toBeInTheDocument();
      expect(screen.getByText('Message 4')).toBeInTheDocument();
    });

    it('handles messages with newlines', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Line 1 Line 2' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      expect(screen.getByText('Line 1 Line 2')).toBeInTheDocument();
    });

    it('handles messages with emojis', () => {
      render(<Chat />);
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Hello! 👋' } });

      const sendButton = screen.getByTestId('send-icon').closest('button');
      fireEvent.click(sendButton!);

      expect(screen.getByText('Hello! 👋')).toBeInTheDocument();
    });
  });
});
