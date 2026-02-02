import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModelSelector } from './ModelSelector';

// Mock localStorage with proper implementation
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    localStorageStore = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('ModelSelector', () => {
  beforeEach(() => {
    localStorageStore = {};
    vi.clearAllMocks();
  });

  describe('full configuration mode', () => {
    it('renders configure button', () => {
      render(<ModelSelector />);

      expect(screen.getByRole('button', { name: /configure models/i })).toBeInTheDocument();
    });

    it('opens dialog when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ModelSelector />);

      await user.click(screen.getByRole('button', { name: /configure models/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Model Configuration')).toBeInTheDocument();
    });

    it('shows all task types in the dialog', async () => {
      const user = userEvent.setup();
      render(<ModelSelector />);

      await user.click(screen.getByRole('button', { name: /configure models/i }));

      expect(screen.getByText('Generation')).toBeInTheDocument();
      expect(screen.getByText('Expansion')).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('Refinement')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('has reset to defaults button', async () => {
      const user = userEvent.setup();
      render(<ModelSelector />);

      await user.click(screen.getByRole('button', { name: /configure models/i }));

      expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument();
    });

    it('has done button that closes dialog', async () => {
      const user = userEvent.setup();
      render(<ModelSelector />);

      await user.click(screen.getByRole('button', { name: /configure models/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /done/i }));

      // Dialog should be closed (not visible)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows tabs for by-task and overview', async () => {
      const user = userEvent.setup();
      render(<ModelSelector />);

      await user.click(screen.getByRole('button', { name: /configure models/i }));

      expect(screen.getByRole('tab', { name: /by task type/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    });
  });

  describe('single task type mode', () => {
    it('renders task type selector for generation', () => {
      render(<ModelSelector taskType="generation" />);

      expect(screen.getByText('Generation')).toBeInTheDocument();
      expect(screen.getByText(/creating new epics/i)).toBeInTheDocument();
    });

    it('renders task type selector for expansion', () => {
      render(<ModelSelector taskType="expansion" />);

      expect(screen.getByText('Expansion')).toBeInTheDocument();
      expect(screen.getByText(/expanding existing/i)).toBeInTheDocument();
    });

    it('renders task type selector for questions', () => {
      render(<ModelSelector taskType="questions" />);

      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText(/generating contextual questions/i)).toBeInTheDocument();
    });

    it('renders task type selector for refinement', () => {
      render(<ModelSelector taskType="refinement" />);

      expect(screen.getByText('Refinement')).toBeInTheDocument();
      expect(screen.getByText(/refining and improving/i)).toBeInTheDocument();
    });

    it('renders task type selector for chat', () => {
      render(<ModelSelector taskType="chat" />);

      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText(/chat and q&a/i)).toBeInTheDocument();
    });

    it('has a model dropdown', () => {
      render(<ModelSelector taskType="generation" />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('renders compact selector', () => {
      render(<ModelSelector taskType="generation" compact />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('does not show description in compact mode', () => {
      render(<ModelSelector taskType="generation" compact />);

      expect(screen.queryByText(/creating new epics/i)).not.toBeInTheDocument();
    });
  });

  describe('callback', () => {
    it('has onModelChange prop that gets passed', () => {
      const onModelChange = vi.fn();
      render(<ModelSelector taskType="generation" onModelChange={onModelChange} />);

      // Verify the component renders with the callback
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      // Note: Full interaction testing of Radix Select is limited in happy-dom
      // due to missing pointer capture APIs. The callback is tested via integration tests.
    });
  });

  describe('className prop', () => {
    it('applies className to wrapper', () => {
      const { container } = render(
        <ModelSelector taskType="generation" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies className in full mode', () => {
      const { container } = render(<ModelSelector className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('ModelSelector accessibility', () => {
  beforeEach(() => {
    localStorageStore = {};
  });

  it('has accessible dialog', async () => {
    const user = userEvent.setup();
    render(<ModelSelector />);

    await user.click(screen.getByRole('button', { name: /configure models/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // Radix UI handles modal behavior internally
  });

  it('has accessible combobox', () => {
    render(<ModelSelector taskType="generation" />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
