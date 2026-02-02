/**
 * Keyboard Shortcuts Help Component
 *
 * F1.1.19 - Keyboard shortcuts
 *
 * Displays all available keyboard shortcuts.
 */

import React, { useMemo } from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  KeyboardShortcut,
  getShortcutDisplayString,
} from '../../lib/hooks/useKeyboardShortcuts';

/**
 * Props for KeyboardShortcutsHelp component
 */
export interface KeyboardShortcutsHelpProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Shortcuts to display */
  shortcuts: KeyboardShortcut[];
  /** Additional class names */
  className?: string;
}

/**
 * Shortcut key display component
 */
function ShortcutKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border rounded">
      {children}
    </kbd>
  );
}

/**
 * Parse shortcut display into individual keys
 */
function parseShortcutKeys(display: string): string[] {
  return display.split('+');
}

/**
 * KeyboardShortcutsHelp Component
 *
 * Displays all available keyboard shortcuts grouped by category.
 */
export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
  shortcuts,
  className,
}: KeyboardShortcutsHelpProps) {
  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};

    for (const shortcut of shortcuts) {
      if (shortcut.enabled === false) continue;

      const category = shortcut.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
    }

    // Sort categories
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      // Put General first, Help last
      if (a === 'General') return -1;
      if (b === 'General') return 1;
      if (a === 'Help') return 1;
      if (b === 'Help') return -1;
      return a.localeCompare(b);
    });

    return sortedCategories.map((category) => ({
      category,
      shortcuts: groups[category],
    }));
  }, [shortcuts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and perform actions quickly.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6">
            {groupedShortcuts.map(({ category, shortcuts: categoryShortcuts }) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-1">
                  {categoryShortcuts.map((shortcut) => {
                    const display = getShortcutDisplayString(
                      shortcut.key,
                      shortcut.modifiers
                    );
                    const keys = parseShortcutKeys(display);

                    return (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {shortcut.name}
                          </div>
                          {shortcut.description && (
                            <div className="text-xs text-muted-foreground">
                              {shortcut.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {keys.map((key, index) => (
                            <React.Fragment key={index}>
                              {index > 0 && (
                                <span className="text-muted-foreground text-xs">
                                  +
                                </span>
                              )}
                              <ShortcutKey>{key}</ShortcutKey>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Press <ShortcutKey>Shift</ShortcutKey> <ShortcutKey>?</ShortcutKey> to
          show this help anytime
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default KeyboardShortcutsHelp;
