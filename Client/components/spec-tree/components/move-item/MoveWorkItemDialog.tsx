/**
 * Move Work Item Dialog Component
 *
 * F1.2.3 - Move items between parents
 *
 * Provides a dialog for selecting a new parent for a work item.
 */

import React from 'react';
import { MoveHorizontal, Check, FolderTree, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  MoveableItem,
  PotentialParent,
  getParentTypeLabel,
  getItemTypeLabel,
} from '../../lib/hooks/useMoveWorkItem';

/**
 * Props for MoveWorkItemDialog component
 */
export interface MoveWorkItemDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Item being moved */
  item: MoveableItem | null;
  /** List of potential parents */
  potentialParents: PotentialParent[];
  /** Currently selected parent */
  selectedParent: PotentialParent | null;
  /** Callback when parent is selected */
  onSelectParent: (parent: PotentialParent) => void;
  /** Callback when move is confirmed */
  onConfirm: () => void;
  /** Callback when move is cancelled */
  onCancel: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Color mapping for parent types
 */
const parentTypeColors: Record<string, string> = {
  epic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  feature: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  userStory: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

/**
 * Parent list item component
 */
function ParentListItem({
  parent,
  isSelected,
  onSelect,
}: {
  parent: PotentialParent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-colors',
        'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary',
        isSelected && 'border-primary bg-primary/5',
        parent.isCurrent && !isSelected && 'border-muted-foreground/30 bg-muted/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 rounded-full p-1',
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
        >
          {isSelected ? (
            <Check className="h-3 w-3" />
          ) : (
            <FolderTree className="h-3 w-3" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{parent.title}</span>
            {parent.isCurrent && (
              <Badge variant="outline" className="text-xs">
                Current
              </Badge>
            )}
          </div>
          {parent.path && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {parent.path}
            </div>
          )}
        </div>
        <Badge className={cn('shrink-0', parentTypeColors[parent.type])}>
          {getParentTypeLabel(parent.type)}
        </Badge>
      </div>
    </button>
  );
}

/**
 * MoveWorkItemDialog Component
 *
 * Dialog for selecting a new parent for a work item.
 */
export function MoveWorkItemDialog({
  open,
  onOpenChange,
  item,
  potentialParents,
  selectedParent,
  onSelectParent,
  onConfirm,
  onCancel,
  className,
}: MoveWorkItemDialogProps) {
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const canConfirm = selectedParent && !selectedParent.isCurrent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveHorizontal className="h-5 w-5" />
            Move {item ? getItemTypeLabel(item.type) : 'Item'}
          </DialogTitle>
          <DialogDescription>
            {item ? (
              <>
                Select a new parent for <strong>&quot;{item.title}&quot;</strong>
              </>
            ) : (
              'Select a new parent for this item'
            )}
          </DialogDescription>
        </DialogHeader>

        {potentialParents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No other parents available
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px] pr-4">
            <div className="space-y-2">
              {potentialParents.map((parent) => (
                <ParentListItem
                  key={parent.id}
                  parent={parent}
                  isSelected={selectedParent?.id === parent.id}
                  onSelect={() => onSelectParent(parent)}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {selectedParent?.isCurrent && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>This is the current parent. Select a different one to move.</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MoveWorkItemDialog;
