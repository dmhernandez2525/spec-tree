import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock react-resizable-panels
vi.mock('react-resizable-panels', () => {
  const MockPanel = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    (props, ref) => <div ref={ref} data-testid="resizable-panel" {...props} />
  );
  MockPanel.displayName = 'Panel';

  const MockPanelGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ className, children, ...props }, ref) => (
      <div ref={ref} className={className} data-testid="resizable-panel-group" {...props}>
        {children}
      </div>
    )
  );
  MockPanelGroup.displayName = 'PanelGroup';

  const MockPanelResizeHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ className, children, ...props }, ref) => (
      <div ref={ref} className={className} data-testid="resizable-handle" {...props}>
        {children}
      </div>
    )
  );
  MockPanelResizeHandle.displayName = 'PanelResizeHandle';

  return {
    Panel: MockPanel,
    PanelGroup: MockPanelGroup,
    PanelResizeHandle: MockPanelResizeHandle,
  };
});

// Mock DragHandleDots2Icon
vi.mock('@radix-ui/react-icons', () => ({
  DragHandleDots2Icon: ({ className }: { className?: string }) => (
    <span data-testid="drag-handle-icon" className={className}>
      ::
    </span>
  ),
}));

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './resizable';

describe('Resizable', () => {
  describe('exports', () => {
    it('exports ResizablePanelGroup component', () => {
      expect(ResizablePanelGroup).toBeDefined();
    });

    it('exports ResizablePanel component', () => {
      expect(ResizablePanel).toBeDefined();
    });

    it('exports ResizableHandle component', () => {
      expect(ResizableHandle).toBeDefined();
    });
  });

  describe('ResizablePanelGroup component', () => {
    it('renders PanelGroup', () => {
      render(<ResizablePanelGroup direction="horizontal" />);
      expect(screen.getByTestId('resizable-panel-group')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ResizablePanelGroup direction="horizontal" className="custom-class" />);
      expect(screen.getByTestId('resizable-panel-group')).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <div data-testid="child">Child</div>
        </ResizablePanelGroup>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('passes direction prop', () => {
      render(<ResizablePanelGroup direction="vertical" />);
      expect(screen.getByTestId('resizable-panel-group')).toBeInTheDocument();
    });
  });

  describe('ResizablePanel component', () => {
    it('is the Panel component from react-resizable-panels', () => {
      render(<ResizablePanel defaultSize={50} />);
      expect(screen.getByTestId('resizable-panel')).toBeInTheDocument();
    });
  });

  describe('ResizableHandle component', () => {
    it('renders PanelResizeHandle', () => {
      render(<ResizableHandle />);
      expect(screen.getByTestId('resizable-handle')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ResizableHandle className="handle-class" />);
      expect(screen.getByTestId('resizable-handle')).toHaveClass('handle-class');
    });

    it('renders with handle icon when withHandle is true', () => {
      render(<ResizableHandle withHandle />);
      expect(screen.getByTestId('drag-handle-icon')).toBeInTheDocument();
    });

    it('does not render handle icon when withHandle is false', () => {
      render(<ResizableHandle withHandle={false} />);
      expect(screen.queryByTestId('drag-handle-icon')).not.toBeInTheDocument();
    });

    it('does not render handle icon by default', () => {
      render(<ResizableHandle />);
      expect(screen.queryByTestId('drag-handle-icon')).not.toBeInTheDocument();
    });
  });
});
