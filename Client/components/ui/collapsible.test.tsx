import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';

describe('Collapsible', () => {
  it('renders collapsible container', () => {
    render(
      <Collapsible data-testid="collapsible">
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId('collapsible')).toBeInTheDocument();
  });

  it('starts closed by default', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('can start open with defaultOpen', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveAttribute('data-state', 'open');
  });

  it('can be controlled with open prop', () => {
    const { rerender } = render(
      <Collapsible open={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId('content')).toHaveAttribute('data-state', 'closed');

    rerender(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId('content')).toHaveAttribute('data-state', 'open');
  });
});

describe('CollapsibleTrigger', () => {
  it('renders trigger button', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('is a button by default', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName.toLowerCase()).toBe('button');
  });

  it('toggles content on click', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(content).toHaveAttribute('data-state', 'closed');

    fireEvent.click(trigger);
    expect(content).toHaveAttribute('data-state', 'open');

    fireEvent.click(trigger);
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('can be disabled', () => {
    render(
      <Collapsible disabled>
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(content).toHaveAttribute('data-state', 'closed');

    fireEvent.click(trigger);
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('can render as child element with asChild', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <span data-testid="trigger">Toggle</span>
        </CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName.toLowerCase()).toBe('span');
  });
});

describe('CollapsibleContent', () => {
  it('renders content', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">
          <p>This is the content</p>
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('This is the content')).toBeInTheDocument();
  });

  it('can have children', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content" className="custom-class">
          Content
        </CollapsibleContent>
      </Collapsible>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('custom-class');
  });
});

describe('Collapsible composition', () => {
  it('works with multiple collapsibles', () => {
    render(
      <div>
        <Collapsible>
          <CollapsibleTrigger data-testid="trigger1">Toggle 1</CollapsibleTrigger>
          <CollapsibleContent data-testid="content1">Content 1</CollapsibleContent>
        </Collapsible>
        <Collapsible>
          <CollapsibleTrigger data-testid="trigger2">Toggle 2</CollapsibleTrigger>
          <CollapsibleContent data-testid="content2">Content 2</CollapsibleContent>
        </Collapsible>
      </div>
    );

    // Both start closed
    expect(screen.getByTestId('content1')).toHaveAttribute('data-state', 'closed');
    expect(screen.getByTestId('content2')).toHaveAttribute('data-state', 'closed');

    // Open first one
    fireEvent.click(screen.getByTestId('trigger1'));
    expect(screen.getByTestId('content1')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('content2')).toHaveAttribute('data-state', 'closed');

    // Open second one
    fireEvent.click(screen.getByTestId('trigger2'));
    expect(screen.getByTestId('content1')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('content2')).toHaveAttribute('data-state', 'open');
  });
});
