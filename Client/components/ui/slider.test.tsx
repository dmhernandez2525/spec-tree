import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock @radix-ui/react-slider - factory must return inline objects
vi.mock('@radix-ui/react-slider', () => {
  const MockRoot = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
    ({ className, children, ...props }, ref) => (
      <span ref={ref} className={className} data-testid="slider-root" role="slider" {...props}>
        {children}
      </span>
    )
  );
  MockRoot.displayName = 'Slider';

  const MockTrack = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
    ({ className, children, ...props }, ref) => (
      <span ref={ref} className={className} data-testid="slider-track" {...props}>
        {children}
      </span>
    )
  );
  MockTrack.displayName = 'SliderTrack';

  const MockRange = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
    ({ className, ...props }, ref) => (
      <span ref={ref} className={className} data-testid="slider-range" {...props} />
    )
  );
  MockRange.displayName = 'SliderRange';

  const MockThumb = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
    ({ className, ...props }, ref) => (
      <span ref={ref} className={className} data-testid="slider-thumb" {...props} />
    )
  );
  MockThumb.displayName = 'SliderThumb';

  return {
    Root: MockRoot,
    Track: MockTrack,
    Range: MockRange,
    Thumb: MockThumb,
  };
});

import { Slider } from './slider';

describe('Slider', () => {
  describe('exports', () => {
    it('exports Slider component', () => {
      expect(Slider).toBeDefined();
    });

    it('has correct displayName', () => {
      expect(Slider.displayName).toBe('Slider');
    });
  });

  describe('rendering', () => {
    it('renders slider root', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.getByTestId('slider-root')).toBeInTheDocument();
    });

    it('renders with role slider', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders track', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.getByTestId('slider-track')).toBeInTheDocument();
    });

    it('renders range', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.getByTestId('slider-range')).toBeInTheDocument();
    });

    it('renders thumb', () => {
      render(<Slider defaultValue={[50]} />);
      expect(screen.getByTestId('slider-thumb')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Slider defaultValue={[50]} className="custom-slider" />);
      expect(screen.getByTestId('slider-root')).toHaveClass('custom-slider');
    });

    it('accepts min and max props', () => {
      render(<Slider defaultValue={[25]} min={0} max={100} />);
      expect(screen.getByTestId('slider-root')).toBeInTheDocument();
    });

    it('accepts step prop', () => {
      render(<Slider defaultValue={[50]} step={10} />);
      expect(screen.getByTestId('slider-root')).toBeInTheDocument();
    });
  });
});
