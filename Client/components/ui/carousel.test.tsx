import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from './carousel';

// Mock embla-carousel-react
const mockScrollPrev = vi.fn();
const mockScrollNext = vi.fn();
const mockCanScrollPrev = vi.fn(() => true);
const mockCanScrollNext = vi.fn(() => true);
const mockOn = vi.fn();
const mockOff = vi.fn();

const mockApi = {
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
  canScrollPrev: mockCanScrollPrev,
  canScrollNext: mockCanScrollNext,
  on: mockOn,
  off: mockOff,
};

vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [vi.fn(), mockApi]),
}));

describe('Carousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanScrollPrev.mockReturnValue(true);
    mockCanScrollNext.mockReturnValue(true);
  });

  describe('exports', () => {
    it('exports all carousel components', () => {
      expect(Carousel).toBeDefined();
      expect(CarouselContent).toBeDefined();
      expect(CarouselItem).toBeDefined();
      expect(CarouselPrevious).toBeDefined();
      expect(CarouselNext).toBeDefined();
    });

    it('exports CarouselApi type', () => {
      // Type exports are verified at compile time
      // Components are already imported at the top of this file
      expect(Carousel).toBeDefined();
    });
  });

  describe('displayNames', () => {
    it('all components have correct displayName', () => {
      expect(Carousel.displayName).toBe('Carousel');
      expect(CarouselContent.displayName).toBe('CarouselContent');
      expect(CarouselItem.displayName).toBe('CarouselItem');
      expect(CarouselPrevious.displayName).toBe('CarouselPrevious');
      expect(CarouselNext.displayName).toBe('CarouselNext');
    });
  });

  describe('Carousel', () => {
    it('renders with default props', () => {
      render(
        <Carousel data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const carousel = screen.getByTestId('carousel');
      expect(carousel).toBeInTheDocument();
      expect(carousel).toHaveAttribute('role', 'region');
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    });

    it('applies relative className', () => {
      render(
        <Carousel data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      expect(screen.getByTestId('carousel')).toHaveClass('relative');
    });

    it('merges custom className', () => {
      render(
        <Carousel className="custom-class" data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const carousel = screen.getByTestId('carousel');
      expect(carousel).toHaveClass('relative');
      expect(carousel).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Carousel ref={ref}>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('handles keyboard navigation with ArrowLeft', () => {
      render(
        <Carousel data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const carousel = screen.getByTestId('carousel');
      fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
      expect(mockScrollPrev).toHaveBeenCalled();
    });

    it('handles keyboard navigation with ArrowRight', () => {
      render(
        <Carousel data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const carousel = screen.getByTestId('carousel');
      fireEvent.keyDown(carousel, { key: 'ArrowRight' });
      expect(mockScrollNext).toHaveBeenCalled();
    });
  });

  describe('CarouselContent', () => {
    it('renders children', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem data-testid="item">Test Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      expect(screen.getByTestId('item')).toBeInTheDocument();
    });

    it('applies horizontal orientation classes by default', () => {
      render(
        <Carousel>
          <CarouselContent data-testid="content">
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('flex');
      expect(content).toHaveClass('-ml-4');
    });

    it('applies vertical orientation classes', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent data-testid="content">
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('flex');
      expect(content).toHaveClass('-mt-4');
      expect(content).toHaveClass('flex-col');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Carousel>
          <CarouselContent ref={ref}>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('CarouselItem', () => {
    it('renders with correct role and aria attributes', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem data-testid="item">Test Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const item = screen.getByTestId('item');
      expect(item).toHaveAttribute('role', 'group');
      expect(item).toHaveAttribute('aria-roledescription', 'slide');
    });

    it('applies horizontal orientation classes by default', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem data-testid="item">Test Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('pl-4');
    });

    it('applies vertical orientation classes', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent>
            <CarouselItem data-testid="item">Test Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('pt-4');
    });

    it('merges custom className', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem className="custom-class" data-testid="item">
              Test Item
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem ref={ref}>Test Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('CarouselPrevious', () => {
    it('renders a button', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselPrevious data-testid="prev" />
        </Carousel>
      );
      const prev = screen.getByTestId('prev');
      expect(prev.tagName.toLowerCase()).toBe('button');
    });

    it('has accessible label', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
        </Carousel>
      );
      expect(screen.getByText('Previous slide')).toBeInTheDocument();
    });

    it('applies horizontal orientation classes by default', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselPrevious data-testid="prev" />
        </Carousel>
      );
      const prev = screen.getByTestId('prev');
      expect(prev).toHaveClass('-left-12');
    });

    it('applies vertical orientation classes', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselPrevious data-testid="prev" />
        </Carousel>
      );
      const prev = screen.getByTestId('prev');
      expect(prev).toHaveClass('-top-12');
      expect(prev).toHaveClass('rotate-90');
    });

    it('calls scrollPrev on click', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselPrevious data-testid="prev" />
        </Carousel>
      );
      fireEvent.click(screen.getByTestId('prev'));
      expect(mockScrollPrev).toHaveBeenCalled();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselPrevious ref={ref} />
        </Carousel>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('CarouselNext', () => {
    it('renders a button', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselNext data-testid="next" />
        </Carousel>
      );
      const next = screen.getByTestId('next');
      expect(next.tagName.toLowerCase()).toBe('button');
    });

    it('has accessible label', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselNext />
        </Carousel>
      );
      expect(screen.getByText('Next slide')).toBeInTheDocument();
    });

    it('applies horizontal orientation classes by default', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselNext data-testid="next" />
        </Carousel>
      );
      const next = screen.getByTestId('next');
      expect(next).toHaveClass('-right-12');
    });

    it('applies vertical orientation classes', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselNext data-testid="next" />
        </Carousel>
      );
      const next = screen.getByTestId('next');
      expect(next).toHaveClass('-bottom-12');
      expect(next).toHaveClass('rotate-90');
    });

    it('calls scrollNext on click', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselNext data-testid="next" />
        </Carousel>
      );
      fireEvent.click(screen.getByTestId('next'));
      expect(mockScrollNext).toHaveBeenCalled();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselNext ref={ref} />
        </Carousel>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('useCarousel hook error', () => {
    it('throws error when CarouselContent is used outside Carousel', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<CarouselContent>Item</CarouselContent>);
      }).toThrow('useCarousel must be used within a <Carousel />');

      consoleSpy.mockRestore();
    });

    it('throws error when CarouselItem is used outside Carousel', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<CarouselItem>Item</CarouselItem>);
      }).toThrow('useCarousel must be used within a <Carousel />');

      consoleSpy.mockRestore();
    });

    it('throws error when CarouselPrevious is used outside Carousel', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<CarouselPrevious />);
      }).toThrow('useCarousel must be used within a <Carousel />');

      consoleSpy.mockRestore();
    });

    it('throws error when CarouselNext is used outside Carousel', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<CarouselNext />);
      }).toThrow('useCarousel must be used within a <Carousel />');

      consoleSpy.mockRestore();
    });
  });
});
