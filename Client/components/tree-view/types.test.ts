import { describe, it, expect } from 'vitest';
import type {
  WorkItemType,
  TreeItemData,
  TreeViewProps,
  TreeItemProps,
  ReorderPayload,
  DragOverlayContentProps,
  UseTreeDragDropOptions,
  UseTreeDragDropReturn,
} from './types';

describe('types.ts', () => {
  describe('Module exports', () => {
    it('can be imported', () => {
      // Types are imported at the top of this file
      // If the imports fail, the test file won't compile
      expect(true).toBe(true);
    });

    it('exports all expected type definitions', () => {
      // Since these are types, we verify they can be imported without error
      // The fact that this file compiles confirms the types exist
      // Types imported at top: WorkItemType, TreeItemData, TreeViewProps,
      // TreeItemProps, ReorderPayload, DragOverlayContentProps,
      // UseTreeDragDropOptions, UseTreeDragDropReturn
      expect(true).toBe(true);
    });
  });

  describe('WorkItemType', () => {
    it('supports epic type', () => {
      const type: WorkItemType = 'epic';
      expect(type).toBe('epic');
    });

    it('supports feature type', () => {
      const type: WorkItemType = 'feature';
      expect(type).toBe('feature');
    });

    it('supports userStory type', () => {
      const type: WorkItemType = 'userStory';
      expect(type).toBe('userStory');
    });

    it('supports task type', () => {
      const type: WorkItemType = 'task';
      expect(type).toBe('task');
    });

    it('allows all valid work item types in an array', () => {
      const allTypes: WorkItemType[] = ['epic', 'feature', 'userStory', 'task'];
      expect(allTypes).toHaveLength(4);
    });
  });

  describe('TreeItemData', () => {
    it('creates valid TreeItemData object', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Test Item',
        type: 'feature',
        parentId: null,
        position: 0,
      };

      expect(item.id).toBe('item-1');
      expect(item.title).toBe('Test Item');
      expect(item.type).toBe('feature');
      expect(item.parentId).toBeNull();
      expect(item.position).toBe(0);
    });

    it('creates TreeItemData with optional documentId', () => {
      const item: TreeItemData = {
        id: 'item-1',
        documentId: 'doc-123',
        title: 'Test Item',
        type: 'epic',
        parentId: null,
        position: 0,
      };

      expect(item.documentId).toBe('doc-123');
    });

    it('creates TreeItemData with children', () => {
      const child: TreeItemData = {
        id: 'child-1',
        title: 'Child Item',
        type: 'task',
        parentId: 'item-1',
        position: 0,
      };

      const item: TreeItemData = {
        id: 'item-1',
        title: 'Parent Item',
        type: 'feature',
        parentId: null,
        position: 0,
        children: [child],
      };

      expect(item.children).toHaveLength(1);
      expect(item.children?.[0].id).toBe('child-1');
    });

    it('creates TreeItemData with custom data', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Test Item',
        type: 'userStory',
        parentId: 'parent-1',
        position: 2,
        data: {
          description: 'A description',
          points: 5,
          assignee: null,
        },
      };

      expect(item.data?.description).toBe('A description');
      expect(item.data?.points).toBe(5);
      expect(item.data?.assignee).toBeNull();
    });

    it('supports string parentId', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Test Item',
        type: 'task',
        parentId: 'parent-123',
        position: 0,
      };

      expect(item.parentId).toBe('parent-123');
    });
  });

  describe('TreeViewProps', () => {
    it('creates valid TreeViewProps object', () => {
      const props: TreeViewProps = {
        items: [],
        onReorder: async () => {},
      };

      expect(props.items).toEqual([]);
      expect(typeof props.onReorder).toBe('function');
    });

    it('creates TreeViewProps with optional renderItem', () => {
      const props: TreeViewProps = {
        items: [],
        onReorder: () => {},
        renderItem: (item, depth) => null,
      };

      expect(typeof props.renderItem).toBe('function');
    });

    it('creates TreeViewProps with optional className', () => {
      const props: TreeViewProps = {
        items: [],
        onReorder: () => {},
        className: 'my-tree',
      };

      expect(props.className).toBe('my-tree');
    });

    it('creates TreeViewProps with optional disabled', () => {
      const props: TreeViewProps = {
        items: [],
        onReorder: () => {},
        disabled: true,
      };

      expect(props.disabled).toBe(true);
    });
  });

  describe('TreeItemProps', () => {
    it('creates valid TreeItemProps object', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Test',
        type: 'feature',
        parentId: null,
        position: 0,
      };

      const props: TreeItemProps = {
        item,
        depth: 0,
      };

      expect(props.item).toBe(item);
      expect(props.depth).toBe(0);
    });

    it('creates TreeItemProps with all optional props', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Test',
        type: 'feature',
        parentId: null,
        position: 0,
      };

      const props: TreeItemProps = {
        item,
        depth: 2,
        isActive: true,
        isOver: false,
        renderContent: (item, depth) => null,
        onToggleExpand: (id) => {},
        isExpanded: true,
      };

      expect(props.isActive).toBe(true);
      expect(props.isOver).toBe(false);
      expect(props.isExpanded).toBe(true);
      expect(typeof props.renderContent).toBe('function');
      expect(typeof props.onToggleExpand).toBe('function');
    });
  });

  describe('ReorderPayload', () => {
    it('creates valid ReorderPayload object', () => {
      const payload: ReorderPayload = {
        itemId: 'item-1',
        itemType: 'feature',
        sourceIndex: 0,
        destinationIndex: 2,
      };

      expect(payload.itemId).toBe('item-1');
      expect(payload.itemType).toBe('feature');
      expect(payload.sourceIndex).toBe(0);
      expect(payload.destinationIndex).toBe(2);
    });

    it('creates ReorderPayload with parent IDs', () => {
      const payload: ReorderPayload = {
        itemId: 'item-1',
        itemType: 'task',
        sourceIndex: 1,
        destinationIndex: 3,
        sourceParentId: 'parent-1',
        destinationParentId: 'parent-2',
      };

      expect(payload.sourceParentId).toBe('parent-1');
      expect(payload.destinationParentId).toBe('parent-2');
    });

    it('creates ReorderPayload with null parent IDs', () => {
      const payload: ReorderPayload = {
        itemId: 'item-1',
        itemType: 'epic',
        sourceIndex: 0,
        destinationIndex: 1,
        sourceParentId: null,
        destinationParentId: null,
      };

      expect(payload.sourceParentId).toBeNull();
      expect(payload.destinationParentId).toBeNull();
    });
  });

  describe('DragOverlayContentProps', () => {
    it('creates valid DragOverlayContentProps object', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Dragging Item',
        type: 'feature',
        parentId: null,
        position: 0,
      };

      const props: DragOverlayContentProps = {
        item,
      };

      expect(props.item).toBe(item);
    });
  });

  describe('UseTreeDragDropOptions', () => {
    it('creates valid UseTreeDragDropOptions object', () => {
      const options: UseTreeDragDropOptions = {
        onReorder: async () => {},
      };

      expect(typeof options.onReorder).toBe('function');
    });

    it('creates UseTreeDragDropOptions with disabled option', () => {
      const options: UseTreeDragDropOptions = {
        onReorder: () => {},
        disabled: true,
      };

      expect(options.disabled).toBe(true);
    });

    it('supports sync onReorder function', () => {
      const options: UseTreeDragDropOptions = {
        onReorder: () => {},
        disabled: false,
      };

      expect(options.disabled).toBe(false);
    });

    it('supports async onReorder function', () => {
      const options: UseTreeDragDropOptions = {
        onReorder: async (payload) => {
          await Promise.resolve();
        },
      };

      expect(typeof options.onReorder).toBe('function');
    });
  });

  describe('UseTreeDragDropReturn', () => {
    it('interface has expected properties', () => {
      // Verify the shape of the return type by creating a mock implementation
      const mockReturn: UseTreeDragDropReturn = {
        activeId: null,
        overId: null,
        activeItem: null,
        isDragging: false,
        sensors: [] as ReturnType<typeof import('@dnd-kit/core').useSensors>,
        handleDragStart: () => {},
        handleDragOver: () => {},
        handleDragEnd: () => {},
        handleDragCancel: () => {},
      };

      expect(mockReturn.activeId).toBeNull();
      expect(mockReturn.overId).toBeNull();
      expect(mockReturn.activeItem).toBeNull();
      expect(mockReturn.isDragging).toBe(false);
      expect(Array.isArray(mockReturn.sensors)).toBe(true);
      expect(typeof mockReturn.handleDragStart).toBe('function');
      expect(typeof mockReturn.handleDragOver).toBe('function');
      expect(typeof mockReturn.handleDragEnd).toBe('function');
      expect(typeof mockReturn.handleDragCancel).toBe('function');
    });

    it('allows activeId to be string', () => {
      const mockReturn: Partial<UseTreeDragDropReturn> = {
        activeId: 'item-1',
      };

      expect(mockReturn.activeId).toBe('item-1');
    });

    it('allows overId to be string', () => {
      const mockReturn: Partial<UseTreeDragDropReturn> = {
        overId: 'item-2',
      };

      expect(mockReturn.overId).toBe('item-2');
    });

    it('allows activeItem to be TreeItemData', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Active Item',
        type: 'feature',
        parentId: null,
        position: 0,
      };

      const mockReturn: Partial<UseTreeDragDropReturn> = {
        activeItem: item,
      };

      expect(mockReturn.activeItem).toBe(item);
    });

    it('allows isDragging to be true', () => {
      const mockReturn: Partial<UseTreeDragDropReturn> = {
        isDragging: true,
      };

      expect(mockReturn.isDragging).toBe(true);
    });
  });

  describe('Type compatibility', () => {
    it('TreeItemData can be used in TreeViewProps items', () => {
      const items: TreeItemData[] = [
        {
          id: 'epic-1',
          title: 'Epic',
          type: 'epic',
          parentId: null,
          position: 0,
          children: [
            {
              id: 'feature-1',
              title: 'Feature',
              type: 'feature',
              parentId: 'epic-1',
              position: 0,
            },
          ],
        },
      ];

      const props: TreeViewProps = {
        items,
        onReorder: () => {},
      };

      expect(props.items).toHaveLength(1);
    });

    it('TreeItemData can be used in TreeItemProps', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Test',
        type: 'feature',
        parentId: null,
        position: 0,
      };

      const props: TreeItemProps = {
        item,
        depth: 0,
      };

      expect(props.item.id).toBe('item-1');
    });

    it('TreeItemData can be used in DragOverlayContentProps', () => {
      const item: TreeItemData = {
        id: 'item-1',
        title: 'Test',
        type: 'feature',
        parentId: null,
        position: 0,
      };

      const props: DragOverlayContentProps = {
        item,
      };

      expect(props.item.title).toBe('Test');
    });

    it('WorkItemType can be used in ReorderPayload', () => {
      const types: WorkItemType[] = ['epic', 'feature', 'userStory', 'task'];

      types.forEach((type) => {
        const payload: ReorderPayload = {
          itemId: 'item-1',
          itemType: type,
          sourceIndex: 0,
          destinationIndex: 1,
        };

        expect(payload.itemType).toBe(type);
      });
    });
  });
});
