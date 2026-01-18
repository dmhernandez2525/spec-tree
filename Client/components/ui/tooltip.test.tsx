import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

describe('Tooltip', () => {
  it('renders tooltip trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('renders as a button by default', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName.toLowerCase()).toBe('button');
  });

  it('can render as other elements with asChild', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span data-testid="trigger">Hover me</span>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName.toLowerCase()).toBe('span');
  });

  it('accepts custom className on trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger" className="custom-class">
            Hover me
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByTestId('trigger')).toHaveClass('custom-class');
  });
});

describe('TooltipProvider', () => {
  it('provides tooltip context', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('accepts delayDuration prop', () => {
    const { container } = render(
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('accepts skipDelayDuration prop', () => {
    const { container } = render(
      <TooltipProvider skipDelayDuration={100}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(container).toBeInTheDocument();
  });
});

describe('TooltipContent', () => {
  it('has correct displayName', () => {
    expect(TooltipContent.displayName).toBe('TooltipContent');
  });

  // Note: Testing TooltipContent rendering with open={true} is challenging in JSDOM
  // due to Radix UI's Portal component and floating-ui's ResizeObserver usage.
  // These tests verify the basic structure without triggering the portal.
});

describe('Tooltip structure', () => {
  it('renders multiple tooltips', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger1">First</TooltipTrigger>
          <TooltipContent>First tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger data-testid="trigger2">Second</TooltipTrigger>
          <TooltipContent>Second tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByTestId('trigger1')).toBeInTheDocument();
    expect(screen.getByTestId('trigger2')).toBeInTheDocument();
  });

  it('passes through data attributes to trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger" data-custom="value">
            Trigger
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-custom', 'value');
  });
});
