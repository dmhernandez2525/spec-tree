/**
 * Tree Controls Component
 *
 * F1.2.1 - Collapsible tree view
 *
 * Provides controls for expanding/collapsing the entire tree hierarchy.
 */

import React from 'react';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TreeNodeType } from '../../lib/hooks/useCollapsibleTree';

export interface TreeControlsProps {
  /** Callback to expand all nodes */
  onExpandAll: () => void;
  /** Callback to collapse all nodes */
  onCollapseAll: () => void;
  /** Callback to expand specific level */
  onExpandLevel?: (level: TreeNodeType) => void;
  /** Callback to collapse specific level */
  onCollapseLevel?: (level: TreeNodeType) => void;
  /** Whether all nodes are currently expanded */
  allExpanded?: boolean;
  /** Whether all nodes are currently collapsed */
  allCollapsed?: boolean;
  /** Number of currently expanded nodes */
  expandedCount?: number;
  /** Total number of nodes */
  totalCount?: number;
  /** Additional class names */
  className?: string;
  /** Show compact version */
  compact?: boolean;
}

/**
 * Tree level labels for display
 */
const levelLabels: Record<TreeNodeType, string> = {
  epic: 'Epics',
  feature: 'Features',
  userStory: 'User Stories',
  task: 'Tasks',
};

/**
 * TreeControls Component
 *
 * Provides Expand All / Collapse All buttons with optional level controls.
 */
export function TreeControls({
  onExpandAll,
  onCollapseAll,
  onExpandLevel,
  onCollapseLevel,
  allExpanded = false,
  allCollapsed = true,
  expandedCount = 0,
  totalCount = 0,
  className,
  compact = false,
}: TreeControlsProps) {
  const hasLevelControls = onExpandLevel && onCollapseLevel;

  if (compact) {
    return (
      <TooltipProvider>
        <div className={cn('flex items-center gap-1', className)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExpandAll}
                disabled={allExpanded}
                className="h-8 w-8"
              >
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Expand all</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCollapseAll}
                disabled={allCollapsed}
                className="h-8 w-8"
              >
                <ChevronsDownUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Collapse all</p>
            </TooltipContent>
          </Tooltip>

          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              {expandedCount}/{totalCount}
            </span>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onExpandAll}
          disabled={allExpanded}
          className="gap-1"
        >
          <ChevronsUpDown className="h-4 w-4" />
          Expand All
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onCollapseAll}
          disabled={allCollapsed}
          className="gap-1"
        >
          <ChevronsDownUp className="h-4 w-4" />
          Collapse All
        </Button>
      </div>

      {hasLevelControls && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <ChevronDown className="h-4 w-4" />
              By Level
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm font-semibold">Expand Level</div>
            {(Object.keys(levelLabels) as TreeNodeType[]).map((level) => (
              <DropdownMenuItem
                key={`expand-${level}`}
                onClick={() => onExpandLevel(level)}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                {levelLabels[level]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm font-semibold">Collapse Level</div>
            {(Object.keys(levelLabels) as TreeNodeType[]).map((level) => (
              <DropdownMenuItem
                key={`collapse-${level}`}
                onClick={() => onCollapseLevel(level)}
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                {levelLabels[level]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {totalCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {expandedCount} of {totalCount} expanded
        </span>
      )}
    </div>
  );
}

export default TreeControls;
