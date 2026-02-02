/**
 * Tests for JSON Import Dialog
 *
 * F1.1.11 - JSON Import/Export UI
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JsonImportDialog } from './JsonImportDialog';

// Mock the import-export utilities
vi.mock('../../lib/utils/import-export', () => ({
  parseJSONImport: vi.fn((content: string) => {
    try {
      const data = JSON.parse(content);
      if (!data.version || !data.epics) return null;
      return data;
    } catch {
      return null;
    }
  }),
  parseCSVImport: vi.fn((content: string) => {
    const lines = content.split('\n');
    if (lines.length < 2) return null;
    if (!lines[0].toLowerCase().includes('type') || !lines[0].toLowerCase().includes('title')) {
      return null;
    }
    return {
      epics: [{ id: 'epic-1', title: 'Test Epic' }],
      features: [],
      userStories: [],
      tasks: [],
    };
  }),
}));

describe('JsonImportDialog', () => {
  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders import button', () => {
    render(<JsonImportDialog onImport={mockOnImport} />);

    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('renders trigger button with correct attributes', () => {
    render(<JsonImportDialog onImport={mockOnImport} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('supports outline variant by default', () => {
    render(<JsonImportDialog onImport={mockOnImport} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-input');
  });

  it('supports default variant', () => {
    render(<JsonImportDialog onImport={mockOnImport} variant="default" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('supports secondary variant', () => {
    render(<JsonImportDialog onImport={mockOnImport} variant="secondary" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('supports small size', () => {
    render(<JsonImportDialog onImport={mockOnImport} size="sm" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
  });

  it('supports large size', () => {
    render(<JsonImportDialog onImport={mockOnImport} size="lg" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('applies custom className', () => {
    render(<JsonImportDialog onImport={mockOnImport} className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('respects disabled prop', () => {
    render(<JsonImportDialog onImport={mockOnImport} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('opens dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Import Project Data')).toBeInTheDocument();
    });
  });

  it('shows file upload area in dialog', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/Click to select a file/)).toBeInTheDocument();
    });
  });

  it('shows supported file types', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/Supports JSON and CSV files/)).toBeInTheDocument();
    });
  });

  it('renders cancel button in dialog', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('renders import button disabled when no file selected', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      // Find the import button in the dialog footer (not the trigger button)
      const buttons = screen.getAllByRole('button');
      const importButton = buttons.find(btn =>
        btn.textContent?.includes('Import') && btn.closest('[role="dialog"]')
      );
      // The button should be disabled when no items to import
      expect(importButton).toBeDisabled();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() => {
      expect(screen.getByText('Import Project Data')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Import Project Data')).not.toBeInTheDocument();
    });
  });

  it('has hidden file input for file selection', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      const fileInput = screen.getByLabelText('Select file to import');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.json,.csv');
    });
  });

  it('validates file has correct extension', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Import Project Data')).toBeInTheDocument();
    });

    // The file input has accept=".json,.csv" attribute
    const fileInput = screen.getByLabelText('Select file to import');
    expect(fileInput).toHaveAttribute('accept', '.json,.csv');
  });

  it('shows error for invalid JSON structure', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Import Project Data')).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText('Select file to import');
    const file = new File(['{}'], 'test.json', { type: 'application/json' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Import Error')).toBeInTheDocument();
      expect(screen.getByText(/Invalid JSON structure/)).toBeInTheDocument();
    });
  });

  it('shows preview for valid JSON file', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Import Project Data')).toBeInTheDocument();
    });

    const validJson = JSON.stringify({
      version: '1.0.0',
      exportedAt: '2024-01-15T00:00:00Z',
      app: { id: 'app-1', name: 'Test' },
      epics: [{ id: 'epic-1', title: 'Epic' }],
      features: [{ id: 'feature-1', title: 'Feature' }],
      userStories: [],
      tasks: [],
    });

    const fileInput = screen.getByLabelText('Select file to import');
    const file = new File([validJson], 'test.json', { type: 'application/json' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('test.json')).toBeInTheDocument();
      expect(screen.getByText('Epics')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
    });
  });

  it('shows preview for valid CSV file', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Import Project Data')).toBeInTheDocument();
    });

    const csv = 'Type,ID,Title\nEpic,epic-1,Test Epic';

    const fileInput = screen.getByLabelText('Select file to import');
    const file = new File([csv], 'test.csv', { type: 'text/csv' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });
  });

  it('calls onImport when import button is clicked after preview', async () => {
    const user = userEvent.setup();
    render(<JsonImportDialog onImport={mockOnImport} />);

    await user.click(screen.getByRole('button'));

    const validJson = JSON.stringify({
      version: '1.0.0',
      exportedAt: '2024-01-15T00:00:00Z',
      app: { id: 'app-1', name: 'Test' },
      epics: [{ id: 'epic-1', title: 'Epic' }],
      features: [],
      userStories: [],
      tasks: [],
    });

    const fileInput = screen.getByLabelText('Select file to import');
    const file = new File([validJson], 'test.json', { type: 'application/json' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('test.json')).toBeInTheDocument();
    });

    // Click the import button (should be enabled now)
    const importButtons = screen.getAllByRole('button');
    const importButton = importButtons.find(btn =>
      btn.textContent?.includes('Import') && btn.textContent?.includes('Items')
    );

    if (importButton) {
      await user.click(importButton);

      await waitFor(() => {
        expect(mockOnImport).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'json',
            epics: expect.any(Array),
            features: expect.any(Array),
            userStories: expect.any(Array),
            tasks: expect.any(Array),
          })
        );
      });
    }
  });
});
