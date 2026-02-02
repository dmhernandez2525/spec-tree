/**
 * Keyboard Shortcuts Hook
 *
 * F1.1.19 - Keyboard shortcuts
 *
 * Provides keyboard shortcut registration and management.
 */

import { useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Modifier keys
 */
export type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Display name for the shortcut */
  name: string;
  /** Description of what the shortcut does */
  description?: string;
  /** Key to press (e.g., 'k', 'Enter', 'Escape') */
  key: string;
  /** Modifier keys required */
  modifiers?: ModifierKey[];
  /** Callback when shortcut is triggered */
  action: () => void;
  /** Category for grouping in help */
  category?: string;
  /** Whether the shortcut is enabled */
  enabled?: boolean;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Shortcut registration
 */
export interface ShortcutRegistration {
  id: string;
  key: string;
  modifiers: ModifierKey[];
  action: () => void;
  preventDefault: boolean;
  enabled: boolean;
}

/**
 * Options for the keyboard shortcuts hook
 */
export interface UseKeyboardShortcutsOptions {
  /** Shortcuts to register */
  shortcuts?: KeyboardShortcut[];
  /** Whether to enable shortcuts globally */
  enabled?: boolean;
  /** Element to attach listeners to (defaults to document) */
  target?: HTMLElement | Document | null;
}

/**
 * Return type for the keyboard shortcuts hook
 */
export interface UseKeyboardShortcutsReturn {
  /** Register a new shortcut */
  register: (shortcut: KeyboardShortcut) => void;
  /** Unregister a shortcut by ID */
  unregister: (id: string) => void;
  /** Enable/disable a specific shortcut */
  setEnabled: (id: string, enabled: boolean) => void;
  /** Get all registered shortcuts */
  getShortcuts: () => KeyboardShortcut[];
  /** Get shortcut display string (e.g., "Ctrl+K") */
  getShortcutDisplay: (id: string) => string;
}

/**
 * Convert key to display format
 */
export function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Escape': 'Esc',
    'Enter': '↵',
    'Backspace': '⌫',
    'Delete': 'Del',
    'Tab': '⇥',
  };

  return keyMap[key] || key.toUpperCase();
}

/**
 * Get display string for a shortcut
 */
export function getShortcutDisplayString(
  key: string,
  modifiers: ModifierKey[] = []
): string {
  const parts: string[] = [];

  // Order modifiers consistently
  if (modifiers.includes('meta')) parts.push('⌘');
  if (modifiers.includes('ctrl')) parts.push('Ctrl');
  if (modifiers.includes('alt')) parts.push('Alt');
  if (modifiers.includes('shift')) parts.push('Shift');

  parts.push(formatKey(key));

  return parts.join('+');
}

/**
 * Check if a keyboard event matches a shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  key: string,
  modifiers: ModifierKey[] = []
): boolean {
  // Check key
  if (event.key.toLowerCase() !== key.toLowerCase()) {
    return false;
  }

  // Check modifiers
  const hasCtrl = modifiers.includes('ctrl');
  const hasAlt = modifiers.includes('alt');
  const hasShift = modifiers.includes('shift');
  const hasMeta = modifiers.includes('meta');

  if (event.ctrlKey !== hasCtrl) return false;
  if (event.altKey !== hasAlt) return false;
  if (event.shiftKey !== hasShift) return false;
  if (event.metaKey !== hasMeta) return false;

  return true;
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }

  // Check for contenteditable
  if (target.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const { shortcuts = [], enabled = true, target } = options;

  const registrationsRef = useRef<Map<string, ShortcutRegistration>>(new Map());
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());

  // Initialize with provided shortcuts
  useEffect(() => {
    for (const shortcut of shortcuts) {
      shortcutsRef.current.set(shortcut.id, shortcut);
      registrationsRef.current.set(shortcut.id, {
        id: shortcut.id,
        key: shortcut.key,
        modifiers: shortcut.modifiers || [],
        action: shortcut.action,
        preventDefault: shortcut.preventDefault ?? true,
        enabled: shortcut.enabled ?? true,
      });
    }
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if typing in an input (unless shortcut explicitly allows it)
      const isInput = isInputElement(event.target);

      for (const registration of Array.from(registrationsRef.current.values())) {
        if (!registration.enabled) continue;

        // Allow Escape in inputs for closing dialogs, etc.
        if (isInput && registration.key.toLowerCase() !== 'escape') continue;

        if (matchesShortcut(event, registration.key, registration.modifiers)) {
          if (registration.preventDefault) {
            event.preventDefault();
          }
          registration.action();
          break;
        }
      }
    },
    [enabled]
  );

  // Attach event listener
  useEffect(() => {
    const targetElement = target || document;

    targetElement.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [target, handleKeyDown]);

  const register = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current.set(shortcut.id, shortcut);
    registrationsRef.current.set(shortcut.id, {
      id: shortcut.id,
      key: shortcut.key,
      modifiers: shortcut.modifiers || [],
      action: shortcut.action,
      preventDefault: shortcut.preventDefault ?? true,
      enabled: shortcut.enabled ?? true,
    });
  }, []);

  const unregister = useCallback((id: string) => {
    shortcutsRef.current.delete(id);
    registrationsRef.current.delete(id);
  }, []);

  const setEnabled = useCallback((id: string, isEnabled: boolean) => {
    const registration = registrationsRef.current.get(id);
    if (registration) {
      registration.enabled = isEnabled;
    }
    const shortcut = shortcutsRef.current.get(id);
    if (shortcut) {
      shortcut.enabled = isEnabled;
    }
  }, []);

  const getShortcuts = useCallback((): KeyboardShortcut[] => {
    return Array.from(shortcutsRef.current.values());
  }, []);

  const getShortcutDisplay = useCallback((id: string): string => {
    const shortcut = shortcutsRef.current.get(id);
    if (!shortcut) return '';
    return getShortcutDisplayString(shortcut.key, shortcut.modifiers);
  }, []);

  return useMemo(
    () => ({
      register,
      unregister,
      setEnabled,
      getShortcuts,
      getShortcutDisplay,
    }),
    [register, unregister, setEnabled, getShortcuts, getShortcutDisplay]
  );
}

/**
 * Default shortcuts for spec-tree
 */
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  {
    id: 'open-command-palette',
    name: 'Open Command Palette',
    description: 'Open the command palette for quick actions',
    key: 'k',
    modifiers: ['ctrl'],
    category: 'General',
  },
  {
    id: 'search',
    name: 'Search',
    description: 'Search for work items',
    key: '/',
    category: 'Navigation',
  },
  {
    id: 'expand-all',
    name: 'Expand All',
    description: 'Expand all tree nodes',
    key: 'e',
    modifiers: ['ctrl', 'shift'],
    category: 'Tree',
  },
  {
    id: 'collapse-all',
    name: 'Collapse All',
    description: 'Collapse all tree nodes',
    key: 'c',
    modifiers: ['ctrl', 'shift'],
    category: 'Tree',
  },
  {
    id: 'new-epic',
    name: 'New Epic',
    description: 'Create a new epic',
    key: 'n',
    modifiers: ['ctrl'],
    category: 'Create',
  },
  {
    id: 'save',
    name: 'Save',
    description: 'Save current changes',
    key: 's',
    modifiers: ['ctrl'],
    category: 'General',
  },
  {
    id: 'help',
    name: 'Show Keyboard Shortcuts',
    description: 'Display all keyboard shortcuts',
    key: '?',
    modifiers: ['shift'],
    category: 'Help',
  },
  {
    id: 'escape',
    name: 'Close/Cancel',
    description: 'Close dialog or cancel operation',
    key: 'Escape',
    category: 'General',
  },
];

export default useKeyboardShortcuts;
