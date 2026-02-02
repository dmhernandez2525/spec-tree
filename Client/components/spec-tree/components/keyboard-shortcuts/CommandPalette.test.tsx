/**
 * Tests for CommandPalette component
 *
 * F1.1.19 - Keyboard shortcuts
 */

import { describe, it, expect, vi } from 'vitest';
import { shortcutsToCommands, CommandPaletteItem } from './CommandPalette';
import { KeyboardShortcut } from '../../lib/hooks/useKeyboardShortcuts';

// Note: Full component rendering tests are skipped due to cmdk/happy-dom
// compatibility issues. The shortcutsToCommands helper is tested instead.

describe('CommandPalette', () => {
  describe('shortcutsToCommands', () => {
    it('converts shortcuts to command items', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'test',
          name: 'Test',
          description: 'Test description',
          key: 'k',
          modifiers: ['ctrl'],
          category: 'Testing',
          action: vi.fn(),
        },
      ];

      const commands = shortcutsToCommands(shortcuts);

      expect(commands).toHaveLength(1);
      expect(commands[0].id).toBe('test');
      expect(commands[0].name).toBe('Test');
      expect(commands[0].shortcut).toBe('Ctrl+K');
      expect(commands[0].category).toBe('Testing');
    });

    it('filters out disabled shortcuts', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'enabled',
          name: 'Enabled',
          key: 'a',
          action: vi.fn(),
        },
        {
          id: 'disabled',
          name: 'Disabled',
          key: 'b',
          action: vi.fn(),
          enabled: false,
        },
      ];

      const commands = shortcutsToCommands(shortcuts);

      expect(commands).toHaveLength(1);
      expect(commands[0].id).toBe('enabled');
    });

    it('preserves action callback', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'test',
          name: 'Test',
          key: 'k',
          action,
        },
      ];

      const commands = shortcutsToCommands(shortcuts);

      commands[0].action();
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('handles shortcuts without modifiers', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'test',
          name: 'Test',
          key: '/',
          action: vi.fn(),
        },
      ];

      const commands = shortcutsToCommands(shortcuts);

      expect(commands[0].shortcut).toBe('/');
    });

    it('handles shortcuts with multiple modifiers', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'test',
          name: 'Test',
          key: 'k',
          modifiers: ['ctrl', 'shift', 'alt'],
          action: vi.fn(),
        },
      ];

      const commands = shortcutsToCommands(shortcuts);

      expect(commands[0].shortcut).toBe('Ctrl+Alt+Shift+K');
    });
  });

  describe('CommandPaletteItem interface', () => {
    it('supports all expected properties', () => {
      const item: CommandPaletteItem = {
        id: 'test',
        name: 'Test',
        description: 'Test description',
        category: 'Testing',
        action: vi.fn(),
        shortcut: 'Ctrl+K',
        keywords: ['test', 'example'],
        disabled: false,
      };

      expect(item.id).toBe('test');
      expect(item.name).toBe('Test');
      expect(item.description).toBe('Test description');
      expect(item.category).toBe('Testing');
      expect(item.shortcut).toBe('Ctrl+K');
      expect(item.keywords).toEqual(['test', 'example']);
      expect(item.disabled).toBe(false);
    });
  });
});
