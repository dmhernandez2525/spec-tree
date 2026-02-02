/**
 * Work Item Breadcrumb Component
 *
 * F1.2.2 - Breadcrumb navigation
 *
 * Displays breadcrumb navigation for work items in the hierarchy.
 */

import React, { useMemo } from 'react';
import { Home, ChevronRight, Layers, Box, FileText, CheckSquare } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BreadcrumbItem as BreadcrumbItemType, WorkItemType } from '../../lib/hooks/useBreadcrumb';

/**
 * Props for WorkItemBreadcrumb component
 */
export interface WorkItemBreadcrumbProps {
  /** Breadcrumb path items */
  items: BreadcrumbItemType[];
  /** Callback when an item is clicked */
  onNavigate?: (item: BreadcrumbItemType) => void;
  /** Show home link at the start */
  showHome?: boolean;
  /** Callback when home is clicked */
  onHomeClick?: () => void;
  /** Maximum items to show before collapsing */
  maxItems?: number;
  /** Additional class names */
  className?: string;
  /** Show item type icons */
  showIcons?: boolean;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Get icon for work item type
 */
function getTypeIcon(type: WorkItemType): React.ReactNode {
  switch (type) {
    case 'epic':
      return <Layers className="h-4 w-4" />;
    case 'feature':
      return <Box className="h-4 w-4" />;
    case 'userStory':
      return <FileText className="h-4 w-4" />;
    case 'task':
      return <CheckSquare className="h-4 w-4" />;
    default:
      return null;
  }
}

/**
 * Get color class for work item type
 */
function getTypeColor(type: WorkItemType): string {
  switch (type) {
    case 'epic':
      return 'text-blue-600';
    case 'feature':
      return 'text-purple-600';
    case 'userStory':
      return 'text-green-600';
    case 'task':
      return 'text-orange-600';
    default:
      return 'text-foreground';
  }
}

/**
 * Truncate title if too long
 */
function truncateTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + '...';
}

/**
 * WorkItemBreadcrumb Component
 *
 * Displays hierarchical navigation path for work items.
 */
export function WorkItemBreadcrumb({
  items,
  onNavigate,
  showHome = false,
  onHomeClick,
  maxItems = 4,
  className,
  showIcons = true,
  compact = false,
}: WorkItemBreadcrumbProps) {
  // Handle collapsed items when there are too many
  const { visibleItems, collapsedItems } = useMemo(() => {
    if (items.length <= maxItems) {
      return { visibleItems: items, collapsedItems: [] };
    }

    // Always show first and last items, collapse middle
    const first = items.slice(0, 1);
    const last = items.slice(-Math.min(2, maxItems - 1));
    const collapsed = items.slice(1, items.length - last.length);

    return {
      visibleItems: [...first, ...last],
      collapsedItems: collapsed,
    };
  }, [items, maxItems]);

  const handleItemClick = (item: BreadcrumbItemType, e: React.MouseEvent) => {
    e.preventDefault();
    if (!item.isCurrent && onNavigate) {
      onNavigate(item);
    }
  };

  const titleMaxLength = compact ? 20 : 30;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {/* Home link */}
        {showHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onHomeClick?.();
                }}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Home className="h-4 w-4" />
                {!compact && <span>Home</span>}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
          </>
        )}

        {/* First visible item */}
        {visibleItems.length > 0 && (
          <>
            <BreadcrumbItem>
              {visibleItems[0].isCurrent ? (
                <BreadcrumbPage
                  className={cn(
                    'flex items-center gap-1.5',
                    showIcons && getTypeColor(visibleItems[0].type)
                  )}
                >
                  {showIcons && getTypeIcon(visibleItems[0].type)}
                  <span>{truncateTitle(visibleItems[0].title, titleMaxLength)}</span>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => handleItemClick(visibleItems[0], e)}
                  className={cn(
                    'flex items-center gap-1.5',
                    showIcons && getTypeColor(visibleItems[0].type)
                  )}
                >
                  {showIcons && getTypeIcon(visibleItems[0].type)}
                  <span>{truncateTitle(visibleItems[0].title, titleMaxLength)}</span>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {/* Collapsed items dropdown */}
            {collapsedItems.length > 0 && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 hover:bg-accent"
                      >
                        <BreadcrumbEllipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {collapsedItems.map((item) => (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => onNavigate?.(item)}
                          className={cn(
                            'flex items-center gap-2',
                            getTypeColor(item.type)
                          )}
                        >
                          {getTypeIcon(item.type)}
                          <span className="flex-1">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.typeLabel}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              </>
            )}

            {/* Remaining visible items */}
            {visibleItems.slice(1).map((item) => (
              <React.Fragment key={item.id}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {item.isCurrent ? (
                    <BreadcrumbPage
                      className={cn(
                        'flex items-center gap-1.5',
                        showIcons && getTypeColor(item.type)
                      )}
                    >
                      {showIcons && getTypeIcon(item.type)}
                      <span>{truncateTitle(item.title, titleMaxLength)}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => handleItemClick(item, e)}
                      className={cn(
                        'flex items-center gap-1.5',
                        showIcons && getTypeColor(item.type)
                      )}
                    >
                      {showIcons && getTypeIcon(item.type)}
                      <span>{truncateTitle(item.title, titleMaxLength)}</span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default WorkItemBreadcrumb;
