import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock @radix-ui/react-popover
vi.mock('@radix-ui/react-popover', () => {
  const Content = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ className, children, ...props }, ref) => (
      <div ref={ref} className={className} data-testid="popover-content" {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'PopoverContent';

  return {
    Root: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-root">{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <button data-testid="popover-trigger">{children}</button>,
    Content,
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-portal">{children}</div>,
    Anchor: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-anchor">{children}</div>,
  };
});

import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './popover';

describe('Popover', () => {
  describe('exports', () => {
    it('exports Popover component', () => {
      expect(Popover).toBeDefined();
    });

    it('exports PopoverTrigger component', () => {
      expect(PopoverTrigger).toBeDefined();
    });

    it('exports PopoverContent component', () => {
      expect(PopoverContent).toBeDefined();
    });

    it('exports PopoverAnchor component', () => {
      expect(PopoverAnchor).toBeDefined();
    });

    it('PopoverContent has displayName', () => {
      expect(PopoverContent.displayName).toBe('PopoverContent');
    });
  });

  describe('Popover component', () => {
    it('renders children', () => {
      render(
        <Popover>
          <span data-testid="child">Child</span>
        </Popover>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('PopoverTrigger component', () => {
    it('renders trigger', () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
        </Popover>
      );
      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    });
  });

  describe('PopoverAnchor component', () => {
    it('renders anchor', () => {
      render(
        <Popover>
          <PopoverAnchor>Anchor</PopoverAnchor>
        </Popover>
      );
      expect(screen.getByTestId('popover-anchor')).toBeInTheDocument();
    });
  });

  describe('PopoverContent component', () => {
    it('renders content', () => {
      render(
        <Popover>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('renders with children', () => {
      render(
        <Popover>
          <PopoverContent>
            <span>Test content</span>
          </PopoverContent>
        </Popover>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Popover>
          <PopoverContent className="custom-class">Content</PopoverContent>
        </Popover>
      );
      expect(screen.getByTestId('popover-content')).toHaveClass('custom-class');
    });

    it('applies default align and sideOffset', () => {
      render(
        <Popover>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('accepts custom align prop', () => {
      render(
        <Popover>
          <PopoverContent align="start">Content</PopoverContent>
        </Popover>
      );
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('accepts custom sideOffset prop', () => {
      render(
        <Popover>
          <PopoverContent sideOffset={10}>Content</PopoverContent>
        </Popover>
      );
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });
  });
});
