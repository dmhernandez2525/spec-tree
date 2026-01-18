import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs', () => {
  it('renders tabs container', () => {
    render(
      <Tabs data-testid="tabs" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    expect(screen.getByTestId('tabs')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });
});

describe('TabsList', () => {
  it('renders a list element', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const list = screen.getByTestId('tabs-list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveRole('tablist');
  });

  it('applies default styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const list = screen.getByTestId('tabs-list');
    expect(list).toHaveClass('inline-flex');
    expect(list).toHaveClass('h-9');
    expect(list).toHaveClass('items-center');
    expect(list).toHaveClass('justify-center');
    expect(list).toHaveClass('rounded-lg');
    expect(list).toHaveClass('bg-muted');
    expect(list).toHaveClass('p-1');
  });

  it('accepts custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list" className="custom-class">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const list = screen.getByTestId('tabs-list');
    expect(list).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <Tabs defaultValue="tab1">
        <TabsList ref={ref}>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TabsList.displayName).toBe('TabsList');
  });
});

describe('TabsTrigger', () => {
  it('renders a tab trigger', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveRole('tab');
  });

  it('applies default styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('inline-flex');
    expect(trigger).toHaveClass('items-center');
    expect(trigger).toHaveClass('justify-center');
    expect(trigger).toHaveClass('whitespace-nowrap');
    expect(trigger).toHaveClass('rounded-md');
    expect(trigger).toHaveClass('px-3');
    expect(trigger).toHaveClass('py-1');
    expect(trigger).toHaveClass('text-sm');
    expect(trigger).toHaveClass('font-medium');
  });

  it('indicates active state', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" data-testid="trigger2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger1 = screen.getByTestId('trigger1');
    const trigger2 = screen.getByTestId('trigger2');
    expect(trigger1).toHaveAttribute('data-state', 'active');
    expect(trigger2).toHaveAttribute('data-state', 'inactive');
  });

  it('can be disabled', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger" disabled>Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" ref={ref}>Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TabsTrigger.displayName).toBe('TabsTrigger');
  });
});

describe('TabsContent', () => {
  it('renders tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content">Content 1</TabsContent>
      </Tabs>
    );

    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveRole('tabpanel');
  });

  it('applies default styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content">Content 1</TabsContent>
      </Tabs>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('mt-2');
  });

  it('accepts custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content" className="custom-class">
          Content 1
        </TabsContent>
      </Tabs>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" ref={ref}>Content 1</TabsContent>
      </Tabs>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TabsContent.displayName).toBe('TabsContent');
  });
});

describe('Tabs state', () => {
  it('shows correct initial active state', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    // First tab content is visible (active)
    const activeContent = container.querySelector('[data-state="active"][role="tabpanel"]');
    expect(activeContent).toHaveTextContent('Content 1');

    // Tab 1 trigger should be active
    expect(screen.getByText('Tab 1').closest('[data-state]')).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Tab 2').closest('[data-state]')).toHaveAttribute('data-state', 'inactive');
  });

  it('shows second tab content when defaultValue is tab2', () => {
    const { container } = render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    // Second tab content is visible (active)
    const activeContent = container.querySelector('[data-state="active"][role="tabpanel"]');
    expect(activeContent).toHaveTextContent('Content 2');

    // Tab 2 trigger should be active
    expect(screen.getByText('Tab 1').closest('[data-state]')).toHaveAttribute('data-state', 'inactive');
    expect(screen.getByText('Tab 2').closest('[data-state]')).toHaveAttribute('data-state', 'active');
  });
});
