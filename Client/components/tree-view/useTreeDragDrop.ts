'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { logger } from '@/lib/logger';
import type {
  TreeItemData,
  ReorderPayload,
  UseTreeDragDropOptions,
  UseTreeDragDropReturn,
} from './types';

export function useTreeDragDrop(
  items: TreeItemData[],
  options: UseTreeDragDropOptions
): UseTreeDragDropReturn {
  const { onReorder, disabled = false } = options;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const flatItems = useMemo(() => {
    const flatten = (items: TreeItemData[]): TreeItemData[] => {
      return items.reduce<TreeItemData[]>((acc, item) => {
        acc.push(item);
        if (item.children && item.children.length > 0) {
          acc.push(...flatten(item.children));
        }
        return acc;
      }, []);
    };
    return flatten(items);
  }, [items]);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return flatItems.find((item) => item.id === activeId) ?? null;
  }, [flatItems, activeId]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (disabled) return;

      const { active } = event;
      setActiveId(active.id as string);
      logger.log('TreeDragDrop', 'Drag started', { itemId: active.id });
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (disabled) return;

      const { over } = event;
      setOverId(over?.id as string | null);
    },
    [disabled]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (disabled) {
        setActiveId(null);
        setOverId(null);
        return;
      }

      const { active, over } = event;

      setActiveId(null);
      setOverId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const activeItemData = flatItems.find((item) => item.id === active.id);
      const overItemData = flatItems.find((item) => item.id === over.id);

      if (!activeItemData || !overItemData) {
        logger.warn('TreeDragDrop', 'Could not find items for drag operation', {
          activeId: active.id,
          overId: over.id,
        });
        return;
      }

      // Find indices within their respective parent containers
      const findIndex = (parentId: string | null, itemId: string): number => {
        const siblings = flatItems.filter((item) => item.parentId === parentId);
        return siblings.findIndex((item) => item.id === itemId);
      };

      const sourceIndex = findIndex(activeItemData.parentId, activeItemData.id);
      const destinationIndex = findIndex(overItemData.parentId, overItemData.id);

      const payload: ReorderPayload = {
        itemId: activeItemData.id,
        itemType: activeItemData.type,
        sourceIndex,
        destinationIndex,
        sourceParentId: activeItemData.parentId,
        destinationParentId: overItemData.parentId,
      };

      logger.log('TreeDragDrop', 'Reorder requested', payload);

      try {
        await onReorder(payload);
      } catch (error) {
        logger.error('TreeDragDrop', 'Reorder failed', { error });
      }
    },
    [disabled, flatItems, onReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
    logger.log('TreeDragDrop', 'Drag cancelled');
  }, []);

  return {
    activeId,
    overId,
    activeItem,
    isDragging: activeId !== null,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}

export default useTreeDragDrop;
