'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { useTreeDragDrop } from './useTreeDragDrop';
import { TreeItem } from './TreeItem';
import { DragOverlayContent } from './DragOverlay';
import type { TreeViewProps, TreeItemData } from './types';

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

export function TreeView({
  items,
  onReorder,
  renderItem,
  className,
  disabled = false,
}: TreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const {
    activeId,
    overId,
    activeItem,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useTreeDragDrop(items, { onReorder, disabled });

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Get flat list of item IDs for SortableContext
  const itemIds = useMemo(() => {
    const flattenIds = (items: TreeItemData[]): string[] => {
      return items.reduce<string[]>((acc, item) => {
        acc.push(item.id);
        if (item.children && item.children.length > 0) {
          acc.push(...flattenIds(item.children));
        }
        return acc;
      }, []);
    };
    return flattenIds(items);
  }, [items]);

  // Determine if an item is expanded (default to expanded if not in set)
  const isExpanded = useCallback(
    (id: string) => {
      // If the expandedIds set is empty, default to expanded
      if (expandedIds.size === 0) return true;
      return expandedIds.has(id);
    },
    [expandedIds]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          className={cn('tree-view', className)}
          role="tree"
          aria-label="Work items tree"
        >
          {items.map((item) => (
            <TreeItem
              key={item.id}
              item={item}
              depth={0}
              isActive={activeId === item.id}
              isOver={overId === item.id}
              renderContent={renderItem}
              onToggleExpand={handleToggleExpand}
              isExpanded={isExpanded(item.id)}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeItem ? <DragOverlayContent item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TreeView;
