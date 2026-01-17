'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TreeItemProps } from './types';

export function TreeItem({
  item,
  depth,
  isActive = false,
  isOver = false,
  renderContent,
  onToggleExpand,
  isExpanded = true,
}: TreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: item.type,
      parentId: item.parentId,
      position: item.position,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'tree-item',
        isDragging && 'tree-item--dragging opacity-50',
        isOver && 'tree-item--over'
      )}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isActive}
      data-item-id={item.id}
      data-item-type={item.type}
    >
      <div
        className={cn(
          'tree-item__content',
          'flex items-center gap-2 p-2 rounded-md',
          'hover:bg-muted/50 transition-colors',
          isDragging && 'opacity-50 bg-background shadow-lg',
          isOver && 'ring-2 ring-primary ring-offset-1'
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Drag Handle */}
        <button
          className={cn(
            'tree-item__handle',
            'cursor-grab active:cursor-grabbing',
            'p-1 rounded hover:bg-muted/80 transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${item.title}`}
          type="button"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Expand/Collapse Toggle */}
        {hasChildren && (
          <button
            className={cn(
              'tree-item__toggle',
              'p-1 rounded hover:bg-muted/80 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
            onClick={() => onToggleExpand?.(item.id)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            type="button"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Spacer for items without children to maintain alignment */}
        {!hasChildren && <div className="w-6" />}

        {/* Item Content */}
        <div className="tree-item__label flex-1 min-w-0">
          {renderContent ? (
            renderContent(item, depth)
          ) : (
            <span className="truncate">{item.title}</span>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div role="group" className="tree-item__children">
          {item.children!.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              renderContent={renderContent}
              onToggleExpand={onToggleExpand}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeItem;
