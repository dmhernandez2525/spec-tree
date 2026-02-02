/**
 * Tests for KeyboardShortcutsHelp component
 *
 * F1.1.19 - Keyboard shortcuts
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { KeyboardShortcut } from '../../lib/hooks/useKeyboardShortcuts';

// Sample shortcuts
const sampleShortcuts: KeyboardShortcut[] = [
  {
    id: 'search',
    name: 'Search',
    description: 'Search for items',
    key: '/',
    category: 'Navigation',
    action: vi.fn(),
  },
  {
    id: 'new-epic',
    name: 'New Epic',
    description: 'Create a new epic',
    key: 'n',
    modifiers: ['ctrl'],
    category: 'Create',
    action: vi.fn(),
  },
  {
    id: 'save',
    name: 'Save',
    key: 's',
    modifiers: ['ctrl'],
    category: 'General',
    action: vi.fn(),
  },
];

describe('KeyboardShortcutsHelp', () => {
  describe('rendering', () => {
    it('renders title when open', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onOpenChange={vi.fn()}
          shortcuts={sampleShortcuts}
        />
      );

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });

    it('renders all shortcuts', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onOpenChange={vi.fn()}
          shortcuts={sampleShortcuts}
        />
      );

      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('New Epic')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('groups shortcuts by category', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onOpenChange={vi.fn()}
          shortcuts={sampleShortcuts}
        />
      );

      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('shows shortcut keys', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onOpenChange={vi.fn()}
          shortcuts={sampleShortcuts}
        />
      );

      // Should show individual keys - use getAllByText since some keys appear multiple times
      expect(screen.getByText('/')).toBeInTheDocument();
      expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0);
      expect(screen.getByText('N')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('shows descriptions', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onOpenChange={vi.fn()}
          shortcuts={sampleShortcuts}
        />
      );

      expect(screen.getByText('Search for items')).toBeInTheDocument();
      expect(screen.getByText('Create a new epic')).toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('hides disabled shortcuts', () => {
      const shortcutsWithDisabled: KeyboardShortcut[] = [
        ...sampleShortcuts,
        {
          id: 'disabled',
          name: 'Disabled Shortcut',
          key: 'd',
          action: vi.fn(),
          enabled: false,
        },
      ];

      render(
        <KeyboardShortcutsHelp
          open={true}
          onOpenChange={vi.fn()}
          shortcuts={shortcutsWithDisabled}
        />
      );

      expect(screen.queryByText('Disabled Shortcut')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders with no shortcuts', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onOpenChange={vi.fn()}
          shortcuts={[]}
        />
      );

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
  });

  describe('help text', () => {
    it('shows how to open help', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onOpenChange={vi.fn()}
          shortcuts={sampleShortcuts}
        />
      );

      expect(screen.getByText('Shift')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });
});
