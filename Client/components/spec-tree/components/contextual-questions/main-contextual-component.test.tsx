import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button onClick={onClick} className={className} data-testid="button" {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange?.(!open)}>
      {open && children}
    </div>
  ),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

// Mock child components
vi.mock('./global-contextual-info-component', () => ({
  default: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid="global-contextual-info">
      GlobalContextualInfo
      {onClose && <button onClick={onClose} data-testid="global-close-btn">Close</button>}
    </div>
  ),
}));

vi.mock('./workitems-contextual-info-component', () => ({
  default: ({ workItemType, _workItem, onClose }: { workItemType: string; _workItem?: unknown; onClose?: () => void }) => (
    <div data-testid="workitems-contextual-info" data-work-item-type={workItemType}>
      WorkitemsContextualInfo - {workItemType}
      {onClose && <button onClick={onClose} data-testid="workitem-close-btn">Close</button>}
    </div>
  ),
}));

describe('MainContextualComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('module can be imported', async () => {
    const testModule = await import('./main-contextual-component');
    expect(testModule.default).toBeDefined();
  });

  it('exports MainContextualComponent as default export', async () => {
    const testModule = await import('./main-contextual-component');
    expect(typeof testModule.default).toBe('function');
  });

  it('component has correct name', async () => {
    const testModule = await import('./main-contextual-component');
    expect(testModule.default.name).toBe('MainContextualComponent');
  });
});

describe('MainContextualComponent structure', () => {
  it('module is a valid React component', async () => {
    const testModule = await import('./main-contextual-component');
    const Component = testModule.default;
    expect(typeof Component).toBe('function');
  });
});

describe('MainContextualComponent rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Open Context Wizard button', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    render(
      <MainContextualComponent
        workItemType="epics"
        content="Global"
      />
    );

    expect(screen.getByText('Open Context Wizard')).toBeInTheDocument();
  });

  it('dialog is closed by default', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    render(
      <MainContextualComponent
        workItemType="epics"
        content="Global"
      />
    );

    const dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveAttribute('data-open', 'false');
  });

  it('opens dialog when button is clicked', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    render(
      <MainContextualComponent
        workItemType="epics"
        content="Global"
      />
    );

    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
    });
  });

  it('renders GlobalContextualInfo when content is Global', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    render(
      <MainContextualComponent
        workItemType="epics"
        content="Global"
      />
    );

    // Open the dialog
    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('global-contextual-info')).toBeInTheDocument();
    });
  });

  it('renders WorkitemsContextualInfo when content is Work Item', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    const mockWorkItem = { id: 'test-1', title: 'Test Epic' };

    render(
      <MainContextualComponent
        workItemType="epics"
        content="Work Item"
        workItem={mockWorkItem as never}
      />
    );

    // Open the dialog
    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('workitems-contextual-info')).toBeInTheDocument();
    });
  });

  it('displays correct dialog title for Global content', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    render(
      <MainContextualComponent
        workItemType="epics"
        content="Global"
      />
    );

    // Open the dialog
    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Global Context Refinement');
    });
  });

  it('displays correct dialog title for epics Work Item', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    const mockWorkItem = { id: 'test-1', title: 'Test Epic' };

    render(
      <MainContextualComponent
        workItemType="epics"
        content="Work Item"
        workItem={mockWorkItem as never}
      />
    );

    // Open the dialog
    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('epic Context Refinement');
    });
  });

  it('displays correct dialog title for features Work Item', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    const mockWorkItem = { id: 'test-1', title: 'Test Feature' };

    render(
      <MainContextualComponent
        workItemType="features"
        content="Work Item"
        workItem={mockWorkItem as never}
      />
    );

    // Open the dialog
    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('feature Context Refinement');
    });
  });

  it('displays correct dialog title for userStories Work Item', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    const mockWorkItem = { id: 'test-1', title: 'Test User Story' };

    render(
      <MainContextualComponent
        workItemType="userStories"
        content="Work Item"
        workItem={mockWorkItem as never}
      />
    );

    // Open the dialog
    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('userStorie Context Refinement');
    });
  });

  it('displays correct dialog title for tasks Work Item', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    const mockWorkItem = { id: 'test-1', title: 'Test Task' };

    render(
      <MainContextualComponent
        workItemType="tasks"
        content="Work Item"
        workItem={mockWorkItem as never}
      />
    );

    // Open the dialog
    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('task Context Refinement');
    });
  });

  it('passes workItemType to WorkitemsContextualInfo', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    const mockWorkItem = { id: 'test-1', title: 'Test Feature' };

    render(
      <MainContextualComponent
        workItemType="features"
        content="Work Item"
        workItem={mockWorkItem as never}
      />
    );

    // Open the dialog
    const button = screen.getByText('Open Context Wizard');
    fireEvent.click(button);

    await waitFor(() => {
      const workitemInfo = screen.getByTestId('workitems-contextual-info');
      expect(workitemInfo).toHaveAttribute('data-work-item-type', 'features');
    });
  });

  it('closes dialog when child component calls onClose for Global', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    render(
      <MainContextualComponent
        workItemType="epics"
        content="Global"
      />
    );

    // Open the dialog
    const openButton = screen.getByText('Open Context Wizard');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByTestId('global-contextual-info')).toBeInTheDocument();
    });

    // Click the close button in the child component
    const closeButton = screen.getByTestId('global-close-btn');
    fireEvent.click(closeButton);

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
    });
  });

  it('closes dialog when child component calls onClose for Work Item', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    const mockWorkItem = { id: 'test-1', title: 'Test Epic' };

    render(
      <MainContextualComponent
        workItemType="epics"
        content="Work Item"
        workItem={mockWorkItem as never}
      />
    );

    // Open the dialog
    const openButton = screen.getByText('Open Context Wizard');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByTestId('workitems-contextual-info')).toBeInTheDocument();
    });

    // Click the close button in the child component
    const closeButton = screen.getByTestId('workitem-close-btn');
    fireEvent.click(closeButton);

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
    });
  });

  it('button has full width class', async () => {
    const MainContextualComponent = (await import('./main-contextual-component')).default;
    render(
      <MainContextualComponent
        workItemType="epics"
        content="Global"
      />
    );

    const button = screen.getByText('Open Context Wizard').closest('button');
    expect(button).toHaveClass('w-full');
  });
});

describe('MainContextualComponent with different work item types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const workItemTypes = ['epics', 'features', 'userStories', 'tasks'] as const;

  workItemTypes.forEach((workItemType) => {
    it(`renders correctly for ${workItemType} type`, async () => {
      const MainContextualComponent = (await import('./main-contextual-component')).default;
      const mockWorkItem = { id: 'test-1', title: `Test ${workItemType}` };

      render(
        <MainContextualComponent
          workItemType={workItemType}
          content="Work Item"
          workItem={mockWorkItem as never}
        />
      );

      expect(screen.getByText('Open Context Wizard')).toBeInTheDocument();
    });
  });
});
