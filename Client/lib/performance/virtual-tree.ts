/**
 * Tree virtualization utilities for rendering large spec trees (1000+ nodes).
 * Provides windowed rendering to maintain smooth scrolling performance
 * by only rendering visible nodes plus a small overscan buffer.
 */

export type TreeNodeType = 'epic' | 'feature' | 'user-story' | 'task';

export interface VirtualTreeItem {
  id: string;
  depth: number;
  label: string;
  type: TreeNodeType;
  isExpanded: boolean;
  hasChildren: boolean;
  parentId?: string;
}

export interface HierarchicalNode {
  id: string;
  label: string;
  type: TreeNodeType;
  children?: HierarchicalNode[];
}

export interface VisibleRange {
  startIndex: number;
  endIndex: number;
}

export interface ItemPosition {
  top: number;
  height: number;
}

/** Height in pixels for each tree row */
export const ITEM_HEIGHT = 36;

/** Number of extra items rendered above and below the visible viewport */
const OVERSCAN = 5;

/**
 * Flattens a hierarchical tree into a flat array of VirtualTreeItem,
 * including only nodes that are visible based on the current expansion state.
 */
export function flattenTree(
  items: HierarchicalNode[],
  expandedIds: Set<string>,
  depth = 0,
  parentId?: string
): VirtualTreeItem[] {
  const result: VirtualTreeItem[] = [];

  for (const item of items) {
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isExpanded = expandedIds.has(item.id);

    result.push({
      id: item.id,
      depth,
      label: item.label,
      type: item.type,
      isExpanded: hasChildren && isExpanded,
      hasChildren,
      parentId,
    });

    if (hasChildren && isExpanded && item.children) {
      const childItems = flattenTree(item.children, expandedIds, depth + 1, item.id);
      result.push(...childItems);
    }
  }

  return result;
}

/**
 * Estimates the total height of the tree container in pixels
 * based on the number of visible items.
 */
export function estimateTreeHeight(itemCount: number): number {
  return itemCount * ITEM_HEIGHT;
}

/**
 * Calculates which items should be rendered based on the current
 * scroll position and container height. Includes an overscan buffer
 * of items above and below the viewport for smoother scrolling.
 */
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemCount: number
): VisibleRange {
  const firstVisible = Math.floor(scrollTop / ITEM_HEIGHT);
  const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);

  const startIndex = Math.max(0, firstVisible - OVERSCAN);
  const endIndex = Math.min(itemCount - 1, firstVisible + visibleCount + OVERSCAN);

  return { startIndex, endIndex };
}

/**
 * Returns the absolute position and height for a tree item at the given index.
 */
export function calculateItemPosition(index: number): ItemPosition {
  return {
    top: index * ITEM_HEIGHT,
    height: ITEM_HEIGHT,
  };
}
