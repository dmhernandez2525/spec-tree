/**
 * Types for the TreeView drag-and-drop component
 */

export type WorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

export interface TreeItemData {
  id: string;
  documentId?: string;
  title: string;
  type: WorkItemType;
  parentId: string | null;
  position: number;
  children?: TreeItemData[];
  data?: Record<string, unknown>;
}

export interface TreeViewProps {
  items: TreeItemData[];
  onReorder: (payload: ReorderPayload) => void | Promise<void>;
  renderItem?: (item: TreeItemData, depth: number) => React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface TreeItemProps {
  item: TreeItemData;
  depth: number;
  isActive?: boolean;
  isOver?: boolean;
  renderContent?: (item: TreeItemData, depth: number) => React.ReactNode;
  onToggleExpand?: (id: string) => void;
  isExpanded?: boolean;
}

export interface ReorderPayload {
  itemId: string;
  itemType: WorkItemType;
  sourceIndex: number;
  destinationIndex: number;
  sourceParentId?: string | null;
  destinationParentId?: string | null;
}

export interface DragOverlayContentProps {
  item: TreeItemData;
}

export interface UseTreeDragDropOptions {
  onReorder: (payload: ReorderPayload) => void | Promise<void>;
  disabled?: boolean;
}

export interface UseTreeDragDropReturn {
  activeId: string | null;
  overId: string | null;
  activeItem: TreeItemData | null;
  isDragging: boolean;
  sensors: ReturnType<typeof import('@dnd-kit/core').useSensors>;
  handleDragStart: (event: import('@dnd-kit/core').DragStartEvent) => void;
  handleDragOver: (event: import('@dnd-kit/core').DragOverEvent) => void;
  handleDragEnd: (event: import('@dnd-kit/core').DragEndEvent) => void;
  handleDragCancel: () => void;
}
