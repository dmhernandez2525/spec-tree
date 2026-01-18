import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  type ChartConfig,
} from './chart';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: vi.fn(({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  )),
  Tooltip: vi.fn(() => <div data-testid="tooltip" />),
  Legend: vi.fn(() => <div data-testid="legend" />),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
  },
}));

// Mock sanitizeCss
vi.mock('@/lib/sanitize', () => ({
  sanitizeCss: vi.fn((css: string) => css),
}));

describe('Chart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exports', () => {
    it('exports all chart components', () => {
      expect(ChartContainer).toBeDefined();
      expect(ChartTooltip).toBeDefined();
      expect(ChartTooltipContent).toBeDefined();
      expect(ChartLegend).toBeDefined();
      expect(ChartLegendContent).toBeDefined();
      expect(ChartStyle).toBeDefined();
    });
  });

  describe('displayNames', () => {
    it('ChartContainer has correct displayName', () => {
      expect(ChartContainer.displayName).toBe('Chart');
    });

    it('ChartTooltipContent has correct displayName', () => {
      expect(ChartTooltipContent.displayName).toBe('ChartTooltip');
    });

    it('ChartLegendContent has correct displayName', () => {
      expect(ChartLegendContent.displayName).toBe('ChartLegend');
    });
  });

  describe('ChartContainer', () => {
    const mockConfig: ChartConfig = {
      test: {
        label: 'Test',
        color: '#ff0000',
      },
    };

    it('renders with required config', () => {
      render(
        <ChartContainer config={mockConfig} data-testid="container">
          <div>Chart content</div>
        </ChartContainer>
      );
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('renders children inside ResponsiveContainer', () => {
      render(
        <ChartContainer config={mockConfig}>
          <div data-testid="chart-child">Chart content</div>
        </ChartContainer>
      );
      expect(screen.getByTestId('chart-child')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('applies default className', () => {
      render(
        <ChartContainer config={mockConfig} data-testid="container">
          <div>Chart content</div>
        </ChartContainer>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('aspect-video');
      expect(container).toHaveClass('justify-center');
    });

    it('merges custom className', () => {
      render(
        <ChartContainer config={mockConfig} className="custom-class" data-testid="container">
          <div>Chart content</div>
        </ChartContainer>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveClass('flex');
    });

    it('sets data-chart attribute with generated id', () => {
      render(
        <ChartContainer config={mockConfig} data-testid="container">
          <div>Chart content</div>
        </ChartContainer>
      );
      const container = screen.getByTestId('container');
      expect(container.getAttribute('data-chart')).toMatch(/^chart-/);
    });

    it('uses custom id when provided', () => {
      render(
        <ChartContainer config={mockConfig} id="my-chart" data-testid="container">
          <div>Chart content</div>
        </ChartContainer>
      );
      const container = screen.getByTestId('container');
      expect(container.getAttribute('data-chart')).toBe('chart-my-chart');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ChartContainer config={mockConfig} ref={ref}>
          <div>Chart content</div>
        </ChartContainer>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('forwards additional props', () => {
      render(
        <ChartContainer config={mockConfig} data-testid="container" data-custom="value">
          <div>Chart content</div>
        </ChartContainer>
      );
      expect(screen.getByTestId('container')).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('ChartStyle', () => {
    it('returns null when no color config', () => {
      const config: ChartConfig = {
        test: {
          label: 'Test',
        },
      };
      const { container } = render(<ChartStyle id="test" config={config} />);
      expect(container.querySelector('style')).toBeNull();
    });

    it('renders style element with color config', () => {
      const config: ChartConfig = {
        test: {
          label: 'Test',
          color: '#ff0000',
        },
      };
      const { container } = render(<ChartStyle id="test" config={config} />);
      const style = container.querySelector('style');
      expect(style).toBeInTheDocument();
    });

    it('renders style element with theme config', () => {
      const config: ChartConfig = {
        test: {
          label: 'Test',
          theme: {
            light: '#ffffff',
            dark: '#000000',
          },
        },
      };
      const { container } = render(<ChartStyle id="test" config={config} />);
      const style = container.querySelector('style');
      expect(style).toBeInTheDocument();
    });
  });

  describe('ChartTooltip', () => {
    it('is defined and is a component', () => {
      expect(ChartTooltip).toBeDefined();
    });
  });

  describe('ChartTooltipContent', () => {
    const mockConfig: ChartConfig = {
      test: {
        label: 'Test Label',
        color: '#ff0000',
      },
    };

    // ChartTooltipContent requires ChartContext, so we need to wrap it in ChartContainer
    it('returns null when not active', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={false} payload={[]} />
        </ChartContainer>
      );
      // The tooltip content should not render when not active
      const tooltipContent = container.querySelector('.grid.min-w-\\[8rem\\]');
      expect(tooltipContent).toBeNull();
    });

    it('returns null when payload is empty', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={[]} />
        </ChartContainer>
      );
      const tooltipContent = container.querySelector('.grid.min-w-\\[8rem\\]');
      expect(tooltipContent).toBeNull();
    });

    it('renders when active with payload', () => {
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: { test: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            data-testid="tooltip-content"
          />
        </ChartContainer>
      );
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('renders with label', () => {
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: { test: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            label="Custom Label"
          />
        </ChartContainer>
      );
      // Label appears in header
      const labels = screen.getAllByText('Custom Label');
      expect(labels.length).toBeGreaterThanOrEqual(1);
    });

    it('hides label when hideLabel is true', () => {
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: { test: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            label="Hidden Label"
            hideLabel={true}
          />
        </ChartContainer>
      );
      expect(screen.queryByText('Hidden Label')).toBeNull();
    });

    it('applies custom className', () => {
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: { test: 100 },
        },
      ];
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            className="custom-tooltip"
          />
        </ChartContainer>
      );
      expect(container.querySelector('.custom-tooltip')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: { test: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            ref={ref}
          />
        </ChartContainer>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('renders dot indicator by default', () => {
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: { test: 100 },
        },
      ];
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
          />
        </ChartContainer>
      );
      // Dot indicator has h-2.5 w-2.5 classes
      expect(container.querySelector('.h-2\\.5.w-2\\.5')).toBeInTheDocument();
    });

    it('renders line indicator when specified', () => {
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: { test: 100 },
        },
      ];
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            indicator="line"
          />
        </ChartContainer>
      );
      // Line indicator has w-1 class
      expect(container.querySelector('.w-1')).toBeInTheDocument();
    });

    it('hides indicator when hideIndicator is true', () => {
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: { test: 100 },
        },
      ];
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            hideIndicator={true}
          />
        </ChartContainer>
      );
      // No indicator should be present
      expect(container.querySelector('.h-2\\.5.w-2\\.5')).toBeNull();
      expect(container.querySelector('.w-1')).toBeNull();
    });
  });

  describe('ChartLegend', () => {
    it('is defined and is a component', () => {
      expect(ChartLegend).toBeDefined();
    });
  });

  describe('ChartLegendContent', () => {
    const mockConfig: ChartConfig = {
      test: {
        label: 'Test Label',
        color: '#ff0000',
      },
    };

    it('returns null when payload is empty', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={[]} />
        </ChartContainer>
      );
      // Should not render any content
      expect(container.querySelector('.flex.items-center.justify-center')).toBeNull();
    });

    it('renders legend items with payload', () => {
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} />
        </ChartContainer>
      );
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('applies verticalAlign top class', () => {
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ];
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} verticalAlign="top" />
        </ChartContainer>
      );
      expect(container.querySelector('.pb-3')).toBeInTheDocument();
    });

    it('applies verticalAlign bottom class by default', () => {
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ];
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} />
        </ChartContainer>
      );
      expect(container.querySelector('.pt-3')).toBeInTheDocument();
    });

    it('renders icon from config when available', () => {
      const TestIcon = () => <svg data-testid="test-icon" />;
      const configWithIcon: ChartConfig = {
        test: {
          label: 'Test Label',
          color: '#ff0000',
          icon: TestIcon,
        },
      };
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ];
      render(
        <ChartContainer config={configWithIcon}>
          <ChartLegendContent payload={payload} />
        </ChartContainer>
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('hides icon when hideIcon is true', () => {
      const TestIcon = () => <svg data-testid="test-icon" />;
      const configWithIcon: ChartConfig = {
        test: {
          label: 'Test Label',
          color: '#ff0000',
          icon: TestIcon,
        },
      };
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ];
      render(
        <ChartContainer config={configWithIcon}>
          <ChartLegendContent payload={payload} hideIcon={true} />
        </ChartContainer>
      );
      expect(screen.queryByTestId('test-icon')).toBeNull();
    });

    it('applies custom className', () => {
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ];
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} className="custom-legend" />
        </ChartContainer>
      );
      expect(container.querySelector('.custom-legend')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} ref={ref} />
        </ChartContainer>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('useChart hook', () => {
    it('throws error when used outside ChartContainer', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<ChartTooltipContent active={true} payload={[]} />);
      }).toThrow('useChart must be used within a <ChartContainer />');

      consoleSpy.mockRestore();
    });
  });
});
