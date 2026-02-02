/**
 * Command Palette Component
 *
 * F1.1.19 - Keyboard shortcuts
 *
 * Quick action palette triggered by Ctrl+K.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Command as CommandIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
  KeyboardShortcut,
  getShortcutDisplayString,
} from '../../lib/hooks/useKeyboardShortcuts';

/**
 * Command item for the palette
 */
export interface CommandPaletteItem {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Category for grouping */
  category?: string;
  /** Action to execute */
  action: () => void;
  /** Keyboard shortcut display */
  shortcut?: string;
  /** Keywords for search */
  keywords?: string[];
  /** Whether the command is disabled */
  disabled?: boolean;
}

/**
 * Props for CommandPalette component
 */
export interface CommandPaletteProps {
  /** Whether the palette is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Commands to display */
  commands: CommandPaletteItem[];
  /** Placeholder text */
  placeholder?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Convert keyboard shortcuts to command items
 */
export function shortcutsToCommands(
  shortcuts: KeyboardShortcut[]
): CommandPaletteItem[] {
  return shortcuts
    .filter((s) => s.enabled !== false)
    .map((shortcut) => ({
      id: shortcut.id,
      name: shortcut.name,
      description: shortcut.description,
      category: shortcut.category,
      action: shortcut.action,
      shortcut: getShortcutDisplayString(shortcut.key, shortcut.modifiers),
    }));
}

/**
 * CommandPalette Component
 *
 * Provides a searchable command palette for quick actions.
 */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
  placeholder = 'Type a command or search...',
  className,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return commands;

    const searchLower = search.toLowerCase();
    return commands.filter((cmd) => {
      if (cmd.name.toLowerCase().includes(searchLower)) return true;
      if (cmd.description?.toLowerCase().includes(searchLower)) return true;
      if (cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower))) return true;
      return false;
    });
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandPaletteItem[]> = {};

    for (const cmd of filteredCommands) {
      const category = cmd.category || 'Actions';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(cmd);
    }

    return groups;
  }, [filteredCommands]);

  const handleSelect = useCallback(
    (commandId: string) => {
      const command = commands.find((c) => c.id === commandId);
      if (command && !command.disabled) {
        onOpenChange(false);
        command.action();
      }
    },
    [commands, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('p-0 gap-0 max-w-lg', className)}>
        <Command className="rounded-lg border-0 shadow-none">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No commands found.</CommandEmpty>
            {Object.entries(groupedCommands).map(([category, items], index) => (
              <React.Fragment key={category}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={category}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={handleSelect}
                      disabled={item.disabled}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon || <CommandIcon className="h-4 w-4" />}
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.shortcut && (
                        <kbd className="ml-auto text-xs tracking-widest text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;
