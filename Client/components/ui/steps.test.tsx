import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Steps, StepsHeader, StepsItem, StepsContent } from './steps';

describe('Steps', () => {
  it('module can be imported', () => {
    expect(Steps).toBeDefined();
    expect(StepsHeader).toBeDefined();
    expect(StepsItem).toBeDefined();
    expect(StepsContent).toBeDefined();
  });

  describe('Steps component', () => {
    it('renders children', () => {
      render(
        <Steps value={0}>
          <div data-testid="child">Child</div>
        </Steps>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Steps ref={ref} value={0}>
          <div>Content</div>
        </Steps>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('applies custom className', () => {
      render(
        <Steps value={0} className="custom-class" data-testid="steps">
          <div>Content</div>
        </Steps>
      );
      expect(screen.getByTestId('steps')).toHaveClass('custom-class');
    });

    it('applies default spacing class', () => {
      render(
        <Steps value={0} data-testid="steps">
          <div>Content</div>
        </Steps>
      );
      expect(screen.getByTestId('steps')).toHaveClass('space-y-4');
    });

    it('has correct displayName', () => {
      expect(Steps.displayName).toBe('Steps');
    });

    it('provides context to children', () => {
      render(
        <Steps value={2}>
          <StepsItem value={0} title="Step 1" data-testid="step-0" />
          <StepsItem value={1} title="Step 2" data-testid="step-1" />
          <StepsItem value={2} title="Step 3" data-testid="step-2" />
        </Steps>
      );
      // Step 0 and 1 should be complete (value < 2)
      // Step 2 should be active (value === 2)
      const step0 = screen.getByTestId('step-0');
      const step1 = screen.getByTestId('step-1');
      const step2 = screen.getByTestId('step-2');

      // Complete steps show check icon instead of number
      expect(step0.querySelector('svg')).toBeInTheDocument();
      expect(step1.querySelector('svg')).toBeInTheDocument();
      // Active step shows number
      expect(step2).toHaveTextContent('3');
    });
  });

  describe('StepsHeader component', () => {
    it('renders children', () => {
      render(
        <Steps value={0}>
          <StepsHeader>
            <div data-testid="header-child">Header Child</div>
          </StepsHeader>
        </Steps>
      );
      expect(screen.getByTestId('header-child')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Steps value={0}>
          <StepsHeader ref={ref}>
            <div>Content</div>
          </StepsHeader>
        </Steps>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('applies custom className', () => {
      render(
        <Steps value={0}>
          <StepsHeader className="custom-header" data-testid="header">
            <div>Content</div>
          </StepsHeader>
        </Steps>
      );
      expect(screen.getByTestId('header')).toHaveClass('custom-header');
    });

    it('has flex layout styles', () => {
      render(
        <Steps value={0}>
          <StepsHeader data-testid="header">
            <div>Content</div>
          </StepsHeader>
        </Steps>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex', 'w-full', 'justify-between');
    });

    it('has correct displayName', () => {
      expect(StepsHeader.displayName).toBe('StepsHeader');
    });
  });

  describe('StepsItem component', () => {
    it('renders a button element', () => {
      render(
        <Steps value={0}>
          <StepsItem value={0} title="Step 1" data-testid="item" />
        </Steps>
      );
      const item = screen.getByTestId('item');
      expect(item.tagName.toLowerCase()).toBe('button');
      expect(item).toHaveAttribute('type', 'button');
    });

    it('shows title text', () => {
      render(
        <Steps value={0}>
          <StepsItem value={0} title="My Step Title" />
        </Steps>
      );
      expect(screen.getByText('My Step Title')).toBeInTheDocument();
    });

    it('shows step number when not complete', () => {
      render(
        <Steps value={0}>
          <StepsItem value={0} title="Step 1" data-testid="item" />
          <StepsItem value={1} title="Step 2" data-testid="item-2" />
        </Steps>
      );
      // Active step shows 1 (value + 1)
      expect(screen.getByTestId('item')).toHaveTextContent('1');
      // Future step shows 2
      expect(screen.getByTestId('item-2')).toHaveTextContent('2');
    });

    it('shows check icon when complete', () => {
      render(
        <Steps value={2}>
          <StepsItem value={0} title="Step 1" data-testid="item" />
        </Steps>
      );
      const item = screen.getByTestId('item');
      // Check icon should be present
      expect(item.querySelector('svg')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Steps value={0}>
          <StepsItem ref={ref} value={0} title="Step 1" />
        </Steps>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('applies custom className', () => {
      render(
        <Steps value={0}>
          <StepsItem value={0} title="Step" className="custom-item" data-testid="item" />
        </Steps>
      );
      expect(screen.getByTestId('item')).toHaveClass('custom-item');
    });

    it('can be disabled', () => {
      render(
        <Steps value={0}>
          <StepsItem value={0} title="Step 1" disabled data-testid="item" />
        </Steps>
      );
      expect(screen.getByTestId('item')).toBeDisabled();
    });

    it('calls onClick handler when clicked', () => {
      const onClick = vi.fn();
      render(
        <Steps value={0}>
          <StepsItem value={0} title="Step 1" onClick={onClick} data-testid="item" />
        </Steps>
      );
      fireEvent.click(screen.getByTestId('item'));
      expect(onClick).toHaveBeenCalled();
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(
        <Steps value={0}>
          <StepsItem value={0} title="Step 1" onClick={onClick} disabled data-testid="item" />
        </Steps>
      );
      fireEvent.click(screen.getByTestId('item'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('has correct displayName', () => {
      expect(StepsItem.displayName).toBe('StepsItem');
    });

    it('applies active styling when active', () => {
      render(
        <Steps value={1}>
          <StepsItem value={1} title="Active Step" data-testid="item" />
        </Steps>
      );
      const item = screen.getByTestId('item');
      // Active step should have primary styling
      const circle = item.querySelector('span');
      expect(circle).toHaveClass('border-primary');
    });

    it('applies complete styling when complete', () => {
      render(
        <Steps value={2}>
          <StepsItem value={0} title="Complete Step" data-testid="item" />
        </Steps>
      );
      const item = screen.getByTestId('item');
      // Complete step should have primary background
      const circle = item.querySelector('span');
      expect(circle).toHaveClass('bg-primary');
    });

    it('applies inactive styling when not active or complete', () => {
      render(
        <Steps value={0}>
          <StepsItem value={2} title="Future Step" data-testid="item" />
        </Steps>
      );
      const item = screen.getByTestId('item');
      // Future step should have muted styling
      const circle = item.querySelector('span');
      expect(circle).toHaveClass('border-muted-foreground');
    });

    it('applies opacity when disabled', () => {
      render(
        <Steps value={0}>
          <StepsItem value={0} title="Disabled Step" disabled data-testid="item" />
        </Steps>
      );
      const item = screen.getByTestId('item');
      const circle = item.querySelector('span');
      expect(circle).toHaveClass('opacity-50');
    });
  });

  describe('StepsContent component', () => {
    it('renders children when active', () => {
      render(
        <Steps value={0}>
          <StepsContent value={0}>
            <div data-testid="content">Active Content</div>
          </StepsContent>
        </Steps>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('does not render children when not active', () => {
      render(
        <Steps value={1}>
          <StepsContent value={0}>
            <div data-testid="content">Inactive Content</div>
          </StepsContent>
        </Steps>
      );
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('forwards ref correctly when active', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Steps value={0}>
          <StepsContent ref={ref} value={0}>
            <div>Content</div>
          </StepsContent>
        </Steps>
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it('applies custom className when active', () => {
      render(
        <Steps value={0}>
          <StepsContent value={0} className="custom-content" data-testid="content-wrapper">
            <div>Content</div>
          </StepsContent>
        </Steps>
      );
      expect(screen.getByTestId('content-wrapper')).toHaveClass('custom-content');
    });

    it('has default spacing styles', () => {
      render(
        <Steps value={0}>
          <StepsContent value={0} data-testid="content-wrapper">
            <div>Content</div>
          </StepsContent>
        </Steps>
      );
      const wrapper = screen.getByTestId('content-wrapper');
      expect(wrapper).toHaveClass('mt-4', 'space-y-4');
    });

    it('has correct displayName', () => {
      expect(StepsContent.displayName).toBe('StepsContent');
    });

    it('switches content when step value changes', () => {
      const { rerender } = render(
        <Steps value={0}>
          <StepsContent value={0}>
            <div data-testid="content-0">Content 0</div>
          </StepsContent>
          <StepsContent value={1}>
            <div data-testid="content-1">Content 1</div>
          </StepsContent>
        </Steps>
      );

      expect(screen.getByTestId('content-0')).toBeInTheDocument();
      expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();

      rerender(
        <Steps value={1}>
          <StepsContent value={0}>
            <div data-testid="content-0">Content 0</div>
          </StepsContent>
          <StepsContent value={1}>
            <div data-testid="content-1">Content 1</div>
          </StepsContent>
        </Steps>
      );

      expect(screen.queryByTestId('content-0')).not.toBeInTheDocument();
      expect(screen.getByTestId('content-1')).toBeInTheDocument();
    });
  });

  describe('integration tests', () => {
    it('renders a complete stepper with all components', () => {
      render(
        <Steps value={1}>
          <StepsHeader>
            <StepsItem value={0} title="Step 1" data-testid="step-0" />
            <StepsItem value={1} title="Step 2" data-testid="step-1" />
            <StepsItem value={2} title="Step 3" data-testid="step-2" />
          </StepsHeader>
          <StepsContent value={0}>
            <div data-testid="content-0">Content for step 1</div>
          </StepsContent>
          <StepsContent value={1}>
            <div data-testid="content-1">Content for step 2</div>
          </StepsContent>
          <StepsContent value={2}>
            <div data-testid="content-2">Content for step 3</div>
          </StepsContent>
        </Steps>
      );

      // Step 0 should be complete
      expect(screen.getByTestId('step-0').querySelector('svg')).toBeInTheDocument();
      // Step 1 should be active (showing number 2)
      expect(screen.getByTestId('step-1')).toHaveTextContent('2');
      // Step 2 should be future (showing number 3)
      expect(screen.getByTestId('step-2')).toHaveTextContent('3');
      // Only content for step 1 (value=1) should be visible
      expect(screen.queryByTestId('content-0')).not.toBeInTheDocument();
      expect(screen.getByTestId('content-1')).toBeInTheDocument();
      expect(screen.queryByTestId('content-2')).not.toBeInTheDocument();
    });

    it('handles step navigation with click handlers', () => {
      const TestComponent = () => {
        const [step, setStep] = React.useState(0);
        return (
          <Steps value={step}>
            <StepsHeader>
              <StepsItem value={0} title="Step 1" onClick={() => setStep(0)} data-testid="step-0" />
              <StepsItem value={1} title="Step 2" onClick={() => setStep(1)} data-testid="step-1" />
              <StepsItem value={2} title="Step 3" onClick={() => setStep(2)} data-testid="step-2" />
            </StepsHeader>
            <StepsContent value={0}>
              <div data-testid="content-0">Content 0</div>
            </StepsContent>
            <StepsContent value={1}>
              <div data-testid="content-1">Content 1</div>
            </StepsContent>
            <StepsContent value={2}>
              <div data-testid="content-2">Content 2</div>
            </StepsContent>
          </Steps>
        );
      };

      render(<TestComponent />);

      // Initial state
      expect(screen.getByTestId('content-0')).toBeInTheDocument();

      // Click step 2
      fireEvent.click(screen.getByTestId('step-1'));
      expect(screen.getByTestId('content-1')).toBeInTheDocument();
      expect(screen.queryByTestId('content-0')).not.toBeInTheDocument();

      // Click step 3
      fireEvent.click(screen.getByTestId('step-2'));
      expect(screen.getByTestId('content-2')).toBeInTheDocument();
      expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();

      // Go back to step 1
      fireEvent.click(screen.getByTestId('step-0'));
      expect(screen.getByTestId('content-0')).toBeInTheDocument();
    });

    it('works with all steps complete', () => {
      render(
        <Steps value={3}>
          <StepsHeader>
            <StepsItem value={0} title="Step 1" data-testid="step-0" />
            <StepsItem value={1} title="Step 2" data-testid="step-1" />
            <StepsItem value={2} title="Step 3" data-testid="step-2" />
          </StepsHeader>
        </Steps>
      );

      // All steps should show check icons
      expect(screen.getByTestId('step-0').querySelector('svg')).toBeInTheDocument();
      expect(screen.getByTestId('step-1').querySelector('svg')).toBeInTheDocument();
      expect(screen.getByTestId('step-2').querySelector('svg')).toBeInTheDocument();
    });

    it('works with all steps pending', () => {
      render(
        <Steps value={-1}>
          <StepsHeader>
            <StepsItem value={0} title="Step 1" data-testid="step-0" />
            <StepsItem value={1} title="Step 2" data-testid="step-1" />
            <StepsItem value={2} title="Step 3" data-testid="step-2" />
          </StepsHeader>
        </Steps>
      );

      // All steps should show numbers (not check icons)
      expect(screen.getByTestId('step-0')).toHaveTextContent('1');
      expect(screen.getByTestId('step-1')).toHaveTextContent('2');
      expect(screen.getByTestId('step-2')).toHaveTextContent('3');
    });
  });
});
