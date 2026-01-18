import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

describe('Accordion', () => {
  it('renders accordion container', () => {
    render(
      <Accordion type="single" collapsible data-testid="accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId('accordion')).toBeInTheDocument();
  });

  it('supports single type', () => {
    render(
      <Accordion type="single" collapsible data-testid="accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('supports multiple type', () => {
    render(
      <Accordion type="multiple" data-testid="accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId('accordion')).toBeInTheDocument();
  });
});

describe('AccordionItem', () => {
  it('renders accordion item', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('border-b');
  });

  it('accepts custom className', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" data-testid="item" className="custom-class">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" ref={ref}>
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(AccordionItem.displayName).toBe('AccordionItem');
  });
});

describe('AccordionTrigger', () => {
  it('renders trigger button', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger data-testid="trigger">Click me</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger data-testid="trigger">Click me</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('flex');
    expect(trigger).toHaveClass('flex-1');
    expect(trigger).toHaveClass('items-center');
    expect(trigger).toHaveClass('justify-between');
    expect(trigger).toHaveClass('py-4');
    expect(trigger).toHaveClass('text-sm');
    expect(trigger).toHaveClass('font-medium');
  });

  it('accepts custom className', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger data-testid="trigger" className="custom-class">
            Click me
          </AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('custom-class');
  });

  it('has chevron icon', () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Click me</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-4');
    expect(icon).toHaveClass('w-4');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger ref={ref}>Click me</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(AccordionTrigger.displayName).toBe('AccordionTrigger');
  });
});

describe('AccordionContent', () => {
  it('renders content', () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Click me</AccordionTrigger>
          <AccordionContent data-testid="content">
            This is the content
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('This is the content')).toBeInTheDocument();
  });

  it('applies default styles to content', () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Click me</AccordionTrigger>
          <AccordionContent data-testid="content">Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('overflow-hidden');
    expect(content).toHaveClass('text-sm');
  });

  it('accepts custom className for inner div', () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Click me</AccordionTrigger>
          <AccordionContent className="custom-content">
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const innerDiv = screen.getByText('Content');
    expect(innerDiv).toHaveClass('custom-content');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Click me</AccordionTrigger>
          <AccordionContent ref={ref}>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(AccordionContent.displayName).toBe('AccordionContent');
  });
});

describe('Accordion interaction', () => {
  it('shows initial open state with defaultValue', () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('toggles on click', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger data-testid="trigger">Item 1</AccordionTrigger>
          <AccordionContent data-testid="content">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Initially closed
    const content = screen.getByTestId('content');
    expect(content).toHaveAttribute('data-state', 'closed');

    // Click to open
    fireEvent.click(screen.getByTestId('trigger'));
    expect(content).toHaveAttribute('data-state', 'open');
  });
});
