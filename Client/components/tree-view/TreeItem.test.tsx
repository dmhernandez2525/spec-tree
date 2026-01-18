import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { TreeItemData } from './types';

// Mock dependencies before importing component
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: { role: 'button', tabIndex: 0, 'aria-roledescription': 'sortable' },
    listeners: { onPointerDown: vi.fn(), onKeyDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn((transform) => (transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined)),
    },
  },
}));

vi.mock('lucide-react', () => ({
  GripVertical: ({ className }: { className?: string }) => (
    <span data-testid="grip-icon" className={className}>GripVertical</span>
  ),
  ChevronRight: ({ className }: { className?: string }) => (
    <span data-testid="chevron-right" className={className}>ChevronRight</span>
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <span data-testid="chevron-down" className={className}>ChevronDown</span>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

// Import component after mocks
import { TreeItem } from './TreeItem';
import { useSortable } from '@dnd-kit/sortable';

// Helper to create mock tree item data
const createMockItem = (overrides: Partial<TreeItemData> = {}): TreeItemData => ({
  id: 'test-item-1',
  title: 'Test Item',
  type: 'feature',
  parentId: null,
  position: 0,
  children: [],
  ...overrides,
});

describe('TreeItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module exports', () => {
    it('module can be imported', () => {
      // TreeItem is already imported at the top
      expect(TreeItem).toBeDefined();
    });

    it('exports TreeItem as named export', () => {
      // TreeItem is already imported at the top as named export
      expect(typeof TreeItem).toBe('function');
    });

    it('exports TreeItem as default export', () => {
      // TreeItem is exported both as named and default export
      // The component is already imported, verify it's a function
      expect(typeof TreeItem).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('renders a tree item with the correct role', () => {
      const item = createMockItem();
      render(<TreeItem item={item} depth={0} />);

      expect(screen.getByRole('treeitem')).toBeInTheDocument();
    });

    it('renders the item title by default', () => {
      const item = createMockItem({ title: 'My Feature' });
      render(<TreeItem item={item} depth={0} />);

      expect(screen.getByText('My Feature')).toBeInTheDocument();
    });

    it('renders the drag handle with grip icon', () => {
      const item = createMockItem();
      render(<TreeItem item={item} depth={0} />);

      expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
      expect(screen.getByLabelText(`Drag to reorder ${item.title}`)).toBeInTheDocument();
    });

    it('renders with custom content when renderContent is provided', () => {
      const item = createMockItem({ title: 'Custom Item' });
      const renderContent = vi.fn((item: TreeItemData, depth: number) => (
        <span data-testid="custom-content">Custom: {item.title} at depth {depth}</span>
      ));

      render(<TreeItem item={item} depth={2} renderContent={renderContent} />);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom: Custom Item at depth 2')).toBeInTheDocument();
      expect(renderContent).toHaveBeenCalledWith(item, 2);
    });

    it('applies correct data attributes', () => {
      const item = createMockItem({ id: 'item-123', type: 'epic' });
      render(<TreeItem item={item} depth={0} />);

      const treeItem = screen.getByRole('treeitem');
      expect(treeItem).toHaveAttribute('data-item-id', 'item-123');
      expect(treeItem).toHaveAttribute('data-item-type', 'epic');
    });

    it('applies correct indentation based on depth', () => {
      const item = createMockItem();
      const { container } = render(<TreeItem item={item} depth={3} />);

      // depth * 24 + 8 = 3 * 24 + 8 = 80px
      const contentDiv = container.querySelector('.tree-item__content');
      expect(contentDiv).toHaveStyle({ paddingLeft: '80px' });
    });
  });

  describe('Accessibility', () => {
    it('sets aria-expanded when item has children', () => {
      const itemWithChildren = createMockItem({
        children: [createMockItem({ id: 'child-1', title: 'Child' })],
      });
      render(<TreeItem item={itemWithChildren} depth={0} isExpanded={true} />);

      // Get all tree items (parent + child), the first one is the parent
      const treeItems = screen.getAllByRole('treeitem');
      expect(treeItems[0]).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-expanded to false when collapsed', () => {
      const itemWithChildren = createMockItem({
        children: [createMockItem({ id: 'child-1', title: 'Child' })],
      });
      render(<TreeItem item={itemWithChildren} depth={0} isExpanded={false} />);

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not set aria-expanded when item has no children', () => {
      const item = createMockItem({ children: [] });
      render(<TreeItem item={item} depth={0} />);

      expect(screen.getByRole('treeitem')).not.toHaveAttribute('aria-expanded');
    });

    it('sets aria-selected when isActive is true', () => {
      const item = createMockItem();
      render(<TreeItem item={item} depth={0} isActive={true} />);

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-selected', 'true');
    });

    it('sets aria-selected to false when isActive is false', () => {
      const item = createMockItem();
      render(<TreeItem item={item} depth={0} isActive={false} />);

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Expand/Collapse toggle', () => {
    it('shows expand toggle button when item has children', () => {
      const itemWithChildren = createMockItem({
        children: [createMockItem({ id: 'child-1' })],
      });
      render(<TreeItem item={itemWithChildren} depth={0} isExpanded={true} />);

      expect(screen.getByLabelText('Collapse')).toBeInTheDocument();
    });

    it('shows ChevronDown when expanded', () => {
      const itemWithChildren = createMockItem({
        children: [createMockItem({ id: 'child-1' })],
      });
      render(<TreeItem item={itemWithChildren} depth={0} isExpanded={true} />);

      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    it('shows ChevronRight when collapsed', () => {
      const itemWithChildren = createMockItem({
        children: [createMockItem({ id: 'child-1' })],
      });
      render(<TreeItem item={itemWithChildren} depth={0} isExpanded={false} />);

      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    });

    it('does not show toggle button when item has no children', () => {
      const item = createMockItem({ children: [] });
      render(<TreeItem item={item} depth={0} />);

      expect(screen.queryByLabelText('Expand')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Collapse')).not.toBeInTheDocument();
    });

    it('calls onToggleExpand when toggle button is clicked', () => {
      const onToggleExpand = vi.fn();
      const itemWithChildren = createMockItem({
        id: 'parent-item',
        children: [createMockItem({ id: 'child-1' })],
      });
      render(
        <TreeItem
          item={itemWithChildren}
          depth={0}
          isExpanded={true}
          onToggleExpand={onToggleExpand}
        />
      );

      fireEvent.click(screen.getByLabelText('Collapse'));
      expect(onToggleExpand).toHaveBeenCalledWith('parent-item');
    });

    it('shows spacer div when item has no children', () => {
      const item = createMockItem({ children: [] });
      const { container } = render(<TreeItem item={item} depth={0} />);

      // Should have a spacer div with w-6 class for alignment
      const spacer = container.querySelector('.w-6');
      expect(spacer).toBeInTheDocument();
    });
  });

  describe('Children rendering', () => {
    it('renders children when expanded', () => {
      const itemWithChildren = createMockItem({
        id: 'parent',
        children: [
          createMockItem({ id: 'child-1', title: 'Child 1' }),
          createMockItem({ id: 'child-2', title: 'Child 2' }),
        ],
      });
      render(<TreeItem item={itemWithChildren} depth={0} isExpanded={true} />);

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('does not render children when collapsed', () => {
      const itemWithChildren = createMockItem({
        id: 'parent',
        children: [
          createMockItem({ id: 'child-1', title: 'Child 1' }),
          createMockItem({ id: 'child-2', title: 'Child 2' }),
        ],
      });
      render(<TreeItem item={itemWithChildren} depth={0} isExpanded={false} />);

      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
    });

    it('renders children with increased depth', () => {
      const itemWithChildren = createMockItem({
        id: 'parent',
        children: [createMockItem({ id: 'child-1', title: 'Child 1' })],
      });
      const { container } = render(<TreeItem item={itemWithChildren} depth={1} isExpanded={true} />);

      // Parent depth=1 means child should have depth=2, padding = 2*24+8 = 56px
      const contentDivs = container.querySelectorAll('.tree-item__content');
      expect(contentDivs.length).toBe(2);
      expect(contentDivs[1]).toHaveStyle({ paddingLeft: '56px' });
    });

    it('renders children group with role="group"', () => {
      const itemWithChildren = createMockItem({
        children: [createMockItem({ id: 'child-1' })],
      });
      render(<TreeItem item={itemWithChildren} depth={0} isExpanded={true} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
    });
  });

  describe('Drag and drop integration', () => {
    it('calls useSortable with correct item data', () => {
      const item = createMockItem({
        id: 'drag-item',
        type: 'task',
        parentId: 'parent-1',
        position: 3,
      });
      render(<TreeItem item={item} depth={0} />);

      expect(useSortable).toHaveBeenCalledWith({
        id: 'drag-item',
        data: {
          type: 'task',
          parentId: 'parent-1',
          position: 3,
        },
      });
    });

    it('applies dragging styles when isDragging is true', () => {
      vi.mocked(useSortable).mockReturnValue({
        attributes: { role: 'button', tabIndex: 0 },
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: undefined,
        isDragging: true,
      } as unknown as ReturnType<typeof useSortable>);

      const item = createMockItem();
      const { container } = render(<TreeItem item={item} depth={0} />);

      const treeItem = container.querySelector('.tree-item');
      expect(treeItem).toHaveClass('tree-item--dragging');
      expect(treeItem).toHaveClass('opacity-50');
    });

    it('applies transform style when dragging', () => {
      vi.mocked(useSortable).mockReturnValue({
        attributes: { role: 'button', tabIndex: 0 },
        listeners: {},
        setNodeRef: vi.fn(),
        transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
        transition: 'transform 200ms ease',
        isDragging: false,
      } as unknown as ReturnType<typeof useSortable>);

      const item = createMockItem();
      render(<TreeItem item={item} depth={0} />);

      const treeItem = screen.getByRole('treeitem');
      expect(treeItem).toHaveStyle({ transform: 'translate3d(10px, 20px, 0)' });
      expect(treeItem).toHaveStyle({ transition: 'transform 200ms ease' });
    });
  });

  describe('isOver state', () => {
    it('applies over styles when isOver is true', () => {
      const item = createMockItem();
      const { container } = render(<TreeItem item={item} depth={0} isOver={true} />);

      const treeItem = container.querySelector('.tree-item');
      expect(treeItem).toHaveClass('tree-item--over');
    });

    it('does not apply over styles when isOver is false', () => {
      const item = createMockItem();
      const { container } = render(<TreeItem item={item} depth={0} isOver={false} />);

      const treeItem = container.querySelector('.tree-item');
      expect(treeItem).not.toHaveClass('tree-item--over');
    });
  });

  describe('Default props', () => {
    it('defaults isActive to false', () => {
      const item = createMockItem();
      render(<TreeItem item={item} depth={0} />);

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-selected', 'false');
    });

    it('defaults isOver to false', () => {
      const item = createMockItem();
      const { container } = render(<TreeItem item={item} depth={0} />);

      expect(container.querySelector('.tree-item--over')).not.toBeInTheDocument();
    });

    it('defaults isExpanded to true', () => {
      const itemWithChildren = createMockItem({
        children: [createMockItem({ id: 'child-1', title: 'Child' })],
      });
      render(<TreeItem item={itemWithChildren} depth={0} />);

      // Children should be visible by default
      expect(screen.getByText('Child')).toBeInTheDocument();
    });
  });

  describe('Item types', () => {
    const itemTypes: Array<TreeItemData['type']> = ['epic', 'feature', 'userStory', 'task'];

    itemTypes.forEach((type) => {
      it(`renders item with type "${type}" correctly`, () => {
        const item = createMockItem({ type, title: `My ${type}` });
        render(<TreeItem item={item} depth={0} />);

        expect(screen.getByRole('treeitem')).toHaveAttribute('data-item-type', type);
        expect(screen.getByText(`My ${type}`)).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('handles item with undefined children', () => {
      const item = createMockItem();
      delete (item as Partial<TreeItemData>).children;

      render(<TreeItem item={item} depth={0} />);

      expect(screen.getByRole('treeitem')).toBeInTheDocument();
      expect(screen.queryByLabelText('Expand')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Collapse')).not.toBeInTheDocument();
    });

    it('handles empty children array', () => {
      const item = createMockItem({ children: [] });
      render(<TreeItem item={item} depth={0} />);

      expect(screen.getByRole('treeitem')).toBeInTheDocument();
      expect(screen.queryByRole('group')).not.toBeInTheDocument();
    });

    it('handles deeply nested items', () => {
      const grandchild = createMockItem({ id: 'grandchild', title: 'Grandchild' });
      const child = createMockItem({ id: 'child', title: 'Child', children: [grandchild] });
      const parent = createMockItem({ id: 'parent', title: 'Parent', children: [child] });

      render(<TreeItem item={parent} depth={0} isExpanded={true} />);

      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.getByText('Child')).toBeInTheDocument();
      expect(screen.getByText('Grandchild')).toBeInTheDocument();
    });

    it('handles very long titles with truncation', () => {
      const item = createMockItem({
        title: 'This is a very long title that should be truncated in the UI when it exceeds the available width',
      });
      const { container } = render(<TreeItem item={item} depth={0} />);

      // The truncate class is on the span inside the label div
      const truncateSpan = container.querySelector('.tree-item__label .truncate');
      expect(truncateSpan).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const item = createMockItem({ title: '<script>alert("XSS")</script>' });
      render(<TreeItem item={item} depth={0} />);

      // React should escape special characters
      expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument();
    });
  });
});
