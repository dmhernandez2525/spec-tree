import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTreeDragDrop } from './useTreeDragDrop';
import type { TreeItemData } from './types';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useSensor: vi.fn().mockReturnValue({}),
  useSensors: vi.fn().mockReturnValue([]),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  sortableKeyboardCoordinates: vi.fn(),
}));

describe('useTreeDragDrop', () => {
  const mockOnReorder = vi.fn();

  const mockItems: TreeItemData[] = [
    {
      id: 'epic-1',
      type: 'epic',
      name: 'Epic 1',
      parentId: null,
      children: [
        {
          id: 'feature-1',
          type: 'feature',
          name: 'Feature 1',
          parentId: 'epic-1',
          children: [],
        },
        {
          id: 'feature-2',
          type: 'feature',
          name: 'Feature 2',
          parentId: 'epic-1',
          children: [],
        },
      ],
    },
    {
      id: 'epic-2',
      type: 'epic',
      name: 'Epic 2',
      parentId: null,
      children: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      expect(result.current.activeId).toBeNull();
      expect(result.current.overId).toBeNull();
      expect(result.current.activeItem).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });

    it('exposes handler functions', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      expect(typeof result.current.handleDragStart).toBe('function');
      expect(typeof result.current.handleDragOver).toBe('function');
      expect(typeof result.current.handleDragEnd).toBe('function');
      expect(typeof result.current.handleDragCancel).toBe('function');
    });
  });

  describe('handleDragStart', () => {
    it('sets activeId when drag starts', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: 'epic-1' },
        } as any);
      });

      expect(result.current.activeId).toBe('epic-1');
      expect(result.current.isDragging).toBe(true);
    });

    it('finds activeItem from flat items', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: 'feature-1' },
        } as any);
      });

      expect(result.current.activeItem).toEqual({
        id: 'feature-1',
        type: 'feature',
        name: 'Feature 1',
        parentId: 'epic-1',
        children: [],
      });
    });

    it('does nothing when disabled', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder, disabled: true })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: 'epic-1' },
        } as any);
      });

      expect(result.current.activeId).toBeNull();
    });
  });

  describe('handleDragOver', () => {
    it('sets overId when dragging over an item', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      act(() => {
        result.current.handleDragOver({
          over: { id: 'epic-2' },
        } as any);
      });

      expect(result.current.overId).toBe('epic-2');
    });

    it('clears overId when not over any item', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      act(() => {
        result.current.handleDragOver({
          over: { id: 'epic-2' },
        } as any);
      });

      expect(result.current.overId).toBe('epic-2');

      act(() => {
        result.current.handleDragOver({
          over: undefined,
        } as any);
      });

      // When over is undefined, overId becomes undefined cast to string | null
      expect(result.current.overId).toBeFalsy();
    });

    it('does nothing when disabled', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder, disabled: true })
      );

      act(() => {
        result.current.handleDragOver({
          over: { id: 'epic-2' },
        } as any);
      });

      expect(result.current.overId).toBeNull();
    });
  });

  describe('handleDragEnd', () => {
    it('resets state after drag ends', async () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: 'epic-1' },
        } as any);
      });

      await act(async () => {
        await result.current.handleDragEnd({
          active: { id: 'epic-1' },
          over: { id: 'epic-2' },
        } as any);
      });

      expect(result.current.activeId).toBeNull();
      expect(result.current.overId).toBeNull();
    });

    it('calls onReorder with correct payload', async () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: { id: 'epic-1' },
          over: { id: 'epic-2' },
        } as any);
      });

      expect(mockOnReorder).toHaveBeenCalledWith({
        itemId: 'epic-1',
        itemType: 'epic',
        sourceIndex: 0,
        destinationIndex: 1,
        sourceParentId: null,
        destinationParentId: null,
      });
    });

    it('does not call onReorder when dropped on same item', async () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: { id: 'epic-1' },
          over: { id: 'epic-1' },
        } as any);
      });

      expect(mockOnReorder).not.toHaveBeenCalled();
    });

    it('does not call onReorder when no over target', async () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: { id: 'epic-1' },
          over: null,
        } as any);
      });

      expect(mockOnReorder).not.toHaveBeenCalled();
    });

    it('handles reorder errors gracefully', async () => {
      const errorOnReorder = vi.fn().mockRejectedValue(new Error('Reorder failed'));
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: errorOnReorder })
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: { id: 'epic-1' },
          over: { id: 'epic-2' },
        } as any);
      });

      expect(errorOnReorder).toHaveBeenCalled();
      // Should not throw, error is caught
    });

    it('does nothing when disabled', async () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder, disabled: true })
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: { id: 'epic-1' },
          over: { id: 'epic-2' },
        } as any);
      });

      expect(mockOnReorder).not.toHaveBeenCalled();
    });
  });

  describe('handleDragCancel', () => {
    it('resets state when drag is cancelled', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: 'epic-1' },
        } as any);
      });

      act(() => {
        result.current.handleDragCancel();
      });

      expect(result.current.activeId).toBeNull();
      expect(result.current.overId).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('flatItems', () => {
    it('correctly flattens nested tree structure', () => {
      const { result } = renderHook(() =>
        useTreeDragDrop(mockItems, { onReorder: mockOnReorder })
      );

      // Start dragging feature-1 to verify it's in the flat list
      act(() => {
        result.current.handleDragStart({
          active: { id: 'feature-1' },
        } as any);
      });

      expect(result.current.activeItem?.id).toBe('feature-1');
      expect(result.current.activeItem?.parentId).toBe('epic-1');
    });
  });
});
