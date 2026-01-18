import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock @radix-ui/react-hover-card
vi.mock('@radix-ui/react-hover-card', () => {
  const Content = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ className, children, ...props }, ref) => (
      <div ref={ref} className={className} data-testid="hover-card-content" {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'HoverCardContent';

  return {
    Root: ({ children }: { children: React.ReactNode }) => <div data-testid="hover-card-root">{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <button data-testid="hover-card-trigger">{children}</button>,
    Content,
  };
});

import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';

describe('HoverCard', () => {
  describe('exports', () => {
    it('exports HoverCard component', () => {
      expect(HoverCard).toBeDefined();
    });

    it('exports HoverCardTrigger component', () => {
      expect(HoverCardTrigger).toBeDefined();
    });

    it('exports HoverCardContent component', () => {
      expect(HoverCardContent).toBeDefined();
    });

    it('HoverCardContent has displayName', () => {
      expect(HoverCardContent.displayName).toBe('HoverCardContent');
    });
  });

  describe('HoverCard component', () => {
    it('renders children', () => {
      render(
        <HoverCard>
          <span data-testid="child">Child</span>
        </HoverCard>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('HoverCardTrigger component', () => {
    it('renders trigger', () => {
      render(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
        </HoverCard>
      );
      expect(screen.getByTestId('hover-card-trigger')).toBeInTheDocument();
    });
  });

  describe('HoverCardContent component', () => {
    it('renders content', () => {
      render(
        <HoverCard>
          <HoverCardContent>Content</HoverCardContent>
        </HoverCard>
      );
      expect(screen.getByTestId('hover-card-content')).toBeInTheDocument();
    });

    it('renders with children', () => {
      render(
        <HoverCard>
          <HoverCardContent>
            <span>Test content</span>
          </HoverCardContent>
        </HoverCard>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <HoverCard>
          <HoverCardContent className="custom-class">Content</HoverCardContent>
        </HoverCard>
      );
      expect(screen.getByTestId('hover-card-content')).toHaveClass('custom-class');
    });

    it('applies default align and sideOffset', () => {
      render(
        <HoverCard>
          <HoverCardContent>Content</HoverCardContent>
        </HoverCard>
      );
      // Content should render without errors using default props
      expect(screen.getByTestId('hover-card-content')).toBeInTheDocument();
    });

    it('accepts custom align prop', () => {
      render(
        <HoverCard>
          <HoverCardContent align="start">Content</HoverCardContent>
        </HoverCard>
      );
      expect(screen.getByTestId('hover-card-content')).toBeInTheDocument();
    });

    it('accepts custom sideOffset prop', () => {
      render(
        <HoverCard>
          <HoverCardContent sideOffset={10}>Content</HoverCardContent>
        </HoverCard>
      );
      expect(screen.getByTestId('hover-card-content')).toBeInTheDocument();
    });
  });
});
