/**
 * Collapsible Tree Hook
 *
 * F1.2.1 - Collapsible tree view
 *
 * Provides centralized state management for expanding/collapsing
 * hierarchy branches in a tree structure.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Node types in the work item hierarchy
 */
export type TreeNodeType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Tree node identifier
 */
export interface TreeNodeId {
  type: TreeNodeType;
  id: string;
}

/**
 * Collapse state map
 */
export type CollapseState = Record<string, boolean>;

/**
 * Options for the collapsible tree hook
 */
export interface UseCollapsibleTreeOptions {
  /** LocalStorage key for persistence */
  storageKey?: string;
  /** Default expanded state for new nodes */
  defaultExpanded?: boolean;
  /** Initial set of expanded node IDs */
  initialExpanded?: string[];
}

/**
 * Return type for the collapsible tree hook
 */
export interface UseCollapsibleTreeReturn {
  /** Map of node IDs to expanded state */
  expandedNodes: CollapseState;
  /** Check if a node is expanded */
  isExpanded: (nodeId: string) => boolean;
  /** Toggle a node's expanded state */
  toggle: (nodeId: string) => void;
  /** Expand a specific node */
  expand: (nodeId: string) => void;
  /** Collapse a specific node */
  collapse: (nodeId: string) => void;
  /** Expand all nodes */
  expandAll: (nodeIds: string[]) => void;
  /** Collapse all nodes */
  collapseAll: () => void;
  /** Expand to a specific node (expands all ancestors) */
  expandToNode: (nodeId: string, ancestors: string[]) => void;
  /** Set multiple nodes' expanded state at once */
  setExpandedNodes: (nodeIds: string[], expanded: boolean) => void;
  /** Get count of expanded nodes */
  expandedCount: number;
  /** Check if all nodes are expanded */
  allExpanded: (nodeIds: string[]) => boolean;
  /** Check if all nodes are collapsed */
  allCollapsed: (nodeIds: string[]) => boolean;
}

/**
 * Storage key prefix
 */
const STORAGE_PREFIX = 'spec-tree-collapse-';

/**
 * Hook for managing collapsible tree state
 */
export function useCollapsibleTree(
  options: UseCollapsibleTreeOptions = {}
): UseCollapsibleTreeReturn {
  const {
    storageKey = 'default',
    defaultExpanded = false,
    initialExpanded = [],
  } = options;

  const fullStorageKey = `${STORAGE_PREFIX}${storageKey}`;

  // Initialize state from localStorage or defaults
  const [expandedNodes, setExpandedNodesState] = useState<CollapseState>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(fullStorageKey);
        if (stored) {
          return JSON.parse(stored) as CollapseState;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Fall back to initial expanded nodes
    const initial: CollapseState = {};
    for (const nodeId of initialExpanded) {
      initial[nodeId] = true;
    }
    return initial;
  });

  // Persist to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(fullStorageKey, JSON.stringify(expandedNodes));
      } catch {
        // Ignore storage errors (quota exceeded, etc.)
      }
    }
  }, [expandedNodes, fullStorageKey]);

  // Check if a node is expanded
  const isExpanded = useCallback(
    (nodeId: string): boolean => {
      return expandedNodes[nodeId] ?? defaultExpanded;
    },
    [expandedNodes, defaultExpanded]
  );

  // Toggle a node's expanded state
  const toggle = useCallback((nodeId: string) => {
    setExpandedNodesState((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  }, []);

  // Expand a specific node
  const expand = useCallback((nodeId: string) => {
    setExpandedNodesState((prev) => ({
      ...prev,
      [nodeId]: true,
    }));
  }, []);

  // Collapse a specific node
  const collapse = useCallback((nodeId: string) => {
    setExpandedNodesState((prev) => ({
      ...prev,
      [nodeId]: false,
    }));
  }, []);

  // Expand all nodes
  const expandAll = useCallback((nodeIds: string[]) => {
    setExpandedNodesState((prev) => {
      const next: CollapseState = { ...prev };
      for (const nodeId of nodeIds) {
        next[nodeId] = true;
      }
      return next;
    });
  }, []);

  // Collapse all nodes
  const collapseAll = useCallback(() => {
    setExpandedNodesState({});
  }, []);

  // Expand to a specific node (expands all ancestors)
  const expandToNode = useCallback((nodeId: string, ancestors: string[]) => {
    setExpandedNodesState((prev) => {
      const next: CollapseState = { ...prev };
      // Expand all ancestors
      for (const ancestorId of ancestors) {
        next[ancestorId] = true;
      }
      // Expand the target node too
      next[nodeId] = true;
      return next;
    });
  }, []);

  // Set multiple nodes' expanded state at once
  const setExpandedNodes = useCallback(
    (nodeIds: string[], expanded: boolean) => {
      setExpandedNodesState((prev) => {
        const next: CollapseState = { ...prev };
        for (const nodeId of nodeIds) {
          next[nodeId] = expanded;
        }
        return next;
      });
    },
    []
  );

  // Count of expanded nodes
  const expandedCount = useMemo(() => {
    return Object.values(expandedNodes).filter(Boolean).length;
  }, [expandedNodes]);

  // Check if all nodes are expanded
  const allExpanded = useCallback(
    (nodeIds: string[]): boolean => {
      if (nodeIds.length === 0) return false;
      return nodeIds.every((id) => expandedNodes[id] === true);
    },
    [expandedNodes]
  );

  // Check if all nodes are collapsed
  const allCollapsed = useCallback(
    (nodeIds: string[]): boolean => {
      if (nodeIds.length === 0) return true;
      return nodeIds.every((id) => !expandedNodes[id]);
    },
    [expandedNodes]
  );

  return {
    expandedNodes,
    isExpanded,
    toggle,
    expand,
    collapse,
    expandAll,
    collapseAll,
    expandToNode,
    setExpandedNodes,
    expandedCount,
    allExpanded,
    allCollapsed,
  };
}

/**
 * Get all node IDs from a tree structure
 *
 * Helper function to collect all node IDs from the work item hierarchy
 */
export function collectAllNodeIds(
  epics: Array<{ id: string; featureIds: string[] }>,
  features: Record<string, { id: string; userStoryIds?: string[] }>,
  userStories: Record<string, { id: string; taskIds?: string[] }>
): string[] {
  const nodeIds: string[] = [];

  for (const epic of epics) {
    nodeIds.push(epic.id);
    for (const featureId of epic.featureIds) {
      nodeIds.push(featureId);
      const feature = features[featureId];
      if (feature?.userStoryIds) {
        for (const userStoryId of feature.userStoryIds) {
          nodeIds.push(userStoryId);
          const userStory = userStories[userStoryId];
          if (userStory?.taskIds) {
            for (const taskId of userStory.taskIds) {
              nodeIds.push(taskId);
            }
          }
        }
      }
    }
  }

  return nodeIds;
}

/**
 * Get ancestors of a node in the tree
 *
 * Helper function to find all ancestor IDs for a given node
 */
export function getNodeAncestors(
  nodeId: string,
  epics: Array<{ id: string; featureIds: string[] }>,
  features: Record<string, { id: string; userStoryIds?: string[]; parentEpicId?: string }>,
  userStories: Record<string, { id: string; taskIds?: string[]; parentFeatureId?: string }>,
  tasks: Record<string, { id: string; parentUserStoryId?: string }>
): string[] {
  const ancestors: string[] = [];

  // Check if it's a task
  const task = tasks[nodeId];
  if (task?.parentUserStoryId) {
    const userStory = userStories[task.parentUserStoryId];
    if (userStory) {
      ancestors.unshift(userStory.id);
      if (userStory.parentFeatureId) {
        const feature = features[userStory.parentFeatureId];
        if (feature) {
          ancestors.unshift(feature.id);
          if (feature.parentEpicId) {
            ancestors.unshift(feature.parentEpicId);
          }
        }
      }
    }
    return ancestors;
  }

  // Check if it's a user story
  const userStory = userStories[nodeId];
  if (userStory?.parentFeatureId) {
    const feature = features[userStory.parentFeatureId];
    if (feature) {
      ancestors.unshift(feature.id);
      if (feature.parentEpicId) {
        ancestors.unshift(feature.parentEpicId);
      }
    }
    return ancestors;
  }

  // Check if it's a feature
  const feature = features[nodeId];
  if (feature?.parentEpicId) {
    ancestors.unshift(feature.parentEpicId);
    return ancestors;
  }

  // Epic or unknown - no ancestors
  return ancestors;
}

export default useCollapsibleTree;
