/**
 * Tests for useKeyboardShortcuts hook
 *
 * F1.1.19 - Keyboard shortcuts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useKeyboardShortcuts,
  formatKey,
  getShortcutDisplayString,
  matchesShortcut,
  DEFAULT_SHORTCUTS,
} from './useKeyboardShortcuts';

// Helper to create keyboard events
function createKeyboardEvent(
  key: string,
  options: {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  } = {}
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    ctrlKey: options.ctrlKey ?? false,
    altKey: options.altKey ?? false,
    shiftKey: options.shiftKey ?? false,
    metaKey: options.metaKey ?? false,
    bubbles: true,
  });
}

describe('formatKey', () => {
  it('formats special keys', () => {
    expect(formatKey(' ')).toBe('Space');
    expect(formatKey('ArrowUp')).toBe('↑');
    expect(formatKey('ArrowDown')).toBe('↓');
    expect(formatKey('Escape')).toBe('Esc');
    expect(formatKey('Enter')).toBe('↵');
  });

  it('uppercases regular keys', () => {
    expect(formatKey('k')).toBe('K');
    expect(formatKey('a')).toBe('A');
  });
});

describe('getShortcutDisplayString', () => {
  it('formats single key', () => {
    expect(getShortcutDisplayString('k')).toBe('K');
  });

  it('formats key with ctrl', () => {
    expect(getShortcutDisplayString('k', ['ctrl'])).toBe('Ctrl+K');
  });

  it('formats key with multiple modifiers', () => {
    expect(getShortcutDisplayString('k', ['ctrl', 'shift'])).toBe('Ctrl+Shift+K');
  });

  it('orders modifiers consistently', () => {
    expect(getShortcutDisplayString('k', ['shift', 'ctrl'])).toBe('Ctrl+Shift+K');
    expect(getShortcutDisplayString('k', ['alt', 'meta', 'ctrl'])).toBe('⌘+Ctrl+Alt+K');
  });
});

describe('matchesShortcut', () => {
  it('matches simple key', () => {
    const event = createKeyboardEvent('k');
    expect(matchesShortcut(event, 'k')).toBe(true);
    expect(matchesShortcut(event, 'j')).toBe(false);
  });

  it('matches key with ctrl', () => {
    const event = createKeyboardEvent('k', { ctrlKey: true });
    expect(matchesShortcut(event, 'k', ['ctrl'])).toBe(true);
    expect(matchesShortcut(event, 'k')).toBe(false);
  });

  it('matches key with multiple modifiers', () => {
    const event = createKeyboardEvent('k', { ctrlKey: true, shiftKey: true });
    expect(matchesShortcut(event, 'k', ['ctrl', 'shift'])).toBe(true);
    expect(matchesShortcut(event, 'k', ['ctrl'])).toBe(false);
  });

  it('is case insensitive', () => {
    const event = createKeyboardEvent('K');
    expect(matchesShortcut(event, 'k')).toBe(true);
  });
});

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('provides required functions', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.unregister).toBe('function');
      expect(typeof result.current.setEnabled).toBe('function');
      expect(typeof result.current.getShortcuts).toBe('function');
      expect(typeof result.current.getShortcutDisplay).toBe('function');
    });

    it('starts with empty shortcuts', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      expect(result.current.getShortcuts()).toEqual([]);
    });

    it('initializes with provided shortcuts', () => {
      const shortcuts = [
        {
          id: 'test',
          name: 'Test',
          key: 'k',
          modifiers: ['ctrl'] as ('ctrl')[],
          action: vi.fn(),
        },
      ];

      const { result } = renderHook(() =>
        useKeyboardShortcuts({ shortcuts })
      );

      expect(result.current.getShortcuts()).toHaveLength(1);
      expect(result.current.getShortcuts()[0].id).toBe('test');
    });
  });

  describe('register and unregister', () => {
    it('registers a new shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      act(() => {
        result.current.register({
          id: 'test',
          name: 'Test',
          key: 'k',
          action: vi.fn(),
        });
      });

      expect(result.current.getShortcuts()).toHaveLength(1);
    });

    it('unregisters a shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      act(() => {
        result.current.register({
          id: 'test',
          name: 'Test',
          key: 'k',
          action: vi.fn(),
        });
      });

      expect(result.current.getShortcuts()).toHaveLength(1);

      act(() => {
        result.current.unregister('test');
      });

      expect(result.current.getShortcuts()).toHaveLength(0);
    });
  });

  describe('shortcut triggering', () => {
    it('triggers shortcut on keydown', () => {
      const action = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [
            {
              id: 'test',
              name: 'Test',
              key: 'k',
              modifiers: ['ctrl'],
              action,
            },
          ],
        })
      );

      const event = createKeyboardEvent('k', { ctrlKey: true });
      document.dispatchEvent(event);

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('does not trigger disabled shortcut', () => {
      const action = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [
            {
              id: 'test',
              name: 'Test',
              key: 'k',
              modifiers: ['ctrl'],
              action,
              enabled: false,
            },
          ],
        })
      );

      const event = createKeyboardEvent('k', { ctrlKey: true });
      document.dispatchEvent(event);

      expect(action).not.toHaveBeenCalled();
    });

    it('does not trigger when globally disabled', () => {
      const action = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [
            {
              id: 'test',
              name: 'Test',
              key: 'k',
              modifiers: ['ctrl'],
              action,
            },
          ],
          enabled: false,
        })
      );

      const event = createKeyboardEvent('k', { ctrlKey: true });
      document.dispatchEvent(event);

      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('setEnabled', () => {
    it('enables a disabled shortcut', () => {
      const action = vi.fn();

      const { result } = renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [
            {
              id: 'test',
              name: 'Test',
              key: 'k',
              modifiers: ['ctrl'],
              action,
              enabled: false,
            },
          ],
        })
      );

      // Should not trigger when disabled
      document.dispatchEvent(createKeyboardEvent('k', { ctrlKey: true }));
      expect(action).not.toHaveBeenCalled();

      // Enable and trigger
      act(() => {
        result.current.setEnabled('test', true);
      });

      document.dispatchEvent(createKeyboardEvent('k', { ctrlKey: true }));
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('getShortcutDisplay', () => {
    it('returns display string for shortcut', () => {
      const { result } = renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [
            {
              id: 'test',
              name: 'Test',
              key: 'k',
              modifiers: ['ctrl', 'shift'],
              action: vi.fn(),
            },
          ],
        })
      );

      expect(result.current.getShortcutDisplay('test')).toBe('Ctrl+Shift+K');
    });

    it('returns empty string for unknown shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      expect(result.current.getShortcutDisplay('unknown')).toBe('');
    });
  });
});

describe('DEFAULT_SHORTCUTS', () => {
  it('has required shortcuts', () => {
    const ids = DEFAULT_SHORTCUTS.map((s) => s.id);

    expect(ids).toContain('open-command-palette');
    expect(ids).toContain('search');
    expect(ids).toContain('expand-all');
    expect(ids).toContain('collapse-all');
    expect(ids).toContain('help');
    expect(ids).toContain('escape');
  });

  it('all shortcuts have required fields', () => {
    for (const shortcut of DEFAULT_SHORTCUTS) {
      expect(shortcut.id).toBeTruthy();
      expect(shortcut.name).toBeTruthy();
      expect(shortcut.key).toBeTruthy();
    }
  });
});
