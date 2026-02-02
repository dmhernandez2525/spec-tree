import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay, FullScreenLoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  describe('rendering', () => {
    it('renders children when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="child-content">Content</div>
        </LoadingOverlay>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.queryAllByRole('status')).toHaveLength(0);
    });

    it('renders overlay when loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div data-testid="child-content">Content</div>
        </LoadingOverlay>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      // Overlay has status role, plus nested spinner
      expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    });

    it('renders with default message', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(
        <LoadingOverlay isLoading={true} message="Saving changes...">
          <div>Content</div>
        </LoadingOverlay>
      );

      expect(screen.getByText('Saving changes...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <LoadingOverlay isLoading={true} className="custom-class">
          <div>Content</div>
        </LoadingOverlay>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('blur effect', () => {
    it('applies backdrop blur by default', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );

      // Find the overlay element by its aria-label
      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).toHaveClass('backdrop-blur-sm');
    });

    it('does not apply blur when blur is false', () => {
      render(
        <LoadingOverlay isLoading={true} blur={false}>
          <div>Content</div>
        </LoadingOverlay>
      );

      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).not.toHaveClass('backdrop-blur-sm');
    });
  });

  describe('accessibility', () => {
    it('has aria-label with message', () => {
      render(
        <LoadingOverlay isLoading={true} message="Processing...">
          <div>Content</div>
        </LoadingOverlay>
      );

      expect(screen.getByLabelText('Processing...')).toBeInTheDocument();
    });

    it('has aria-live polite', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );

      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to container', () => {
      const ref = vi.fn();
      render(
        <LoadingOverlay ref={ref} isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(LoadingOverlay.displayName).toBe('LoadingOverlay');
    });
  });
});

describe('FullScreenLoadingOverlay', () => {
  describe('rendering', () => {
    it('renders nothing when not loading', () => {
      const { container } = render(
        <FullScreenLoadingOverlay isLoading={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders overlay when loading', () => {
      render(<FullScreenLoadingOverlay isLoading={true} />);

      // Find by aria-label instead of role to avoid multiple matches
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });

    it('renders with default message', () => {
      render(<FullScreenLoadingOverlay isLoading={true} />);

      // Message appears twice: once in <p> and once in sr-only <span>
      const messages = screen.getAllByText('Loading...');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('renders with custom message', () => {
      render(
        <FullScreenLoadingOverlay isLoading={true} message="Please wait..." />
      );

      // Message appears twice: once in <p> and once in sr-only <span>
      const messages = screen.getAllByText('Please wait...');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('applies custom className', () => {
      render(
        <FullScreenLoadingOverlay isLoading={true} className="custom-class" />
      );

      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).toHaveClass('custom-class');
    });
  });

  describe('blur effect', () => {
    it('applies backdrop blur by default', () => {
      render(<FullScreenLoadingOverlay isLoading={true} />);

      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).toHaveClass('backdrop-blur-sm');
    });

    it('does not apply blur when blur is false', () => {
      render(<FullScreenLoadingOverlay isLoading={true} blur={false} />);

      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).not.toHaveClass('backdrop-blur-sm');
    });
  });

  describe('fixed positioning', () => {
    it('has fixed position class', () => {
      render(<FullScreenLoadingOverlay isLoading={true} />);

      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).toHaveClass('fixed');
    });

    it('has inset-0 for full coverage', () => {
      render(<FullScreenLoadingOverlay isLoading={true} />);

      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).toHaveClass('inset-0');
    });

    it('has high z-index', () => {
      render(<FullScreenLoadingOverlay isLoading={true} />);

      const overlay = screen.getByLabelText('Loading...');
      expect(overlay).toHaveClass('z-50');
    });
  });

  describe('accessibility', () => {
    it('has screen reader text', () => {
      render(<FullScreenLoadingOverlay isLoading={true} message="Loading..." />);

      const srTexts = screen.getAllByText('Loading...').filter((el) =>
        el.classList.contains('sr-only')
      );
      expect(srTexts.length).toBeGreaterThan(0);
    });

    it('has aria-label with message', () => {
      render(
        <FullScreenLoadingOverlay isLoading={true} message="Initializing..." />
      );

      expect(screen.getByLabelText('Initializing...')).toBeInTheDocument();
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref', () => {
      const ref = vi.fn();
      render(<FullScreenLoadingOverlay ref={ref} isLoading={true} />);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(FullScreenLoadingOverlay.displayName).toBe(
        'FullScreenLoadingOverlay'
      );
    });
  });
});
