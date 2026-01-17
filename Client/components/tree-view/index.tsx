/**
 * TreeView component for drag-and-drop reordering of hierarchical work items
 *
 * @example
 * ```tsx
 * import { TreeView } from '@/components/tree-view';
 *
 * <TreeView
 *   items={workItems}
 *   onReorder={(payload) => handleReorder(payload)}
 *   renderItem={(item, depth) => <CustomItem item={item} />}
 * />
 * ```
 */

export { TreeView } from './TreeView';
export { TreeItem } from './TreeItem';
export { DragOverlayContent } from './DragOverlay';
export { useTreeDragDrop } from './useTreeDragDrop';
export type {
  TreeViewProps,
  TreeItemProps,
  TreeItemData,
  ReorderPayload,
  WorkItemType,
  DragOverlayContentProps,
  UseTreeDragDropOptions,
  UseTreeDragDropReturn,
} from './types';
