import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './toast';

describe('Toast exports', () => {
  it('exports ToastProvider component', () => {
    expect(ToastProvider).toBeDefined();
  });

  it('exports ToastViewport with displayName', () => {
    expect(ToastViewport).toBeDefined();
    expect(ToastViewport.displayName).toBe('ToastViewport');
  });

  it('exports Toast with displayName', () => {
    expect(Toast).toBeDefined();
    expect(Toast.displayName).toBe('Toast');
  });

  it('exports ToastTitle with displayName', () => {
    expect(ToastTitle).toBeDefined();
    expect(ToastTitle.displayName).toBe('ToastTitle');
  });

  it('exports ToastDescription with displayName', () => {
    expect(ToastDescription).toBeDefined();
    expect(ToastDescription.displayName).toBe('ToastDescription');
  });

  it('exports ToastClose with displayName', () => {
    expect(ToastClose).toBeDefined();
    expect(ToastClose.displayName).toBe('ToastClose');
  });

  it('exports ToastAction with displayName', () => {
    expect(ToastAction).toBeDefined();
    expect(ToastAction.displayName).toBe('ToastAction');
  });
});

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child</div>
      </ToastProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('ToastViewport', () => {
  it('renders correctly', () => {
    render(
      <ToastProvider>
        <ToastViewport data-testid="viewport" />
      </ToastProvider>
    );
    expect(screen.getByTestId('viewport')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLOListElement>();
    render(
      <ToastProvider>
        <ToastViewport ref={ref} />
      </ToastProvider>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('applies custom className', () => {
    render(
      <ToastProvider>
        <ToastViewport className="custom-class" data-testid="viewport" />
      </ToastProvider>
    );
    expect(screen.getByTestId('viewport')).toHaveClass('custom-class');
  });

  it('has default positioning classes', () => {
    render(
      <ToastProvider>
        <ToastViewport data-testid="viewport" />
      </ToastProvider>
    );
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveClass('fixed', 'top-0', 'z-[100]', 'flex', 'w-full', 'p-4');
  });
});

describe('Toast', () => {
  it('renders with default variant', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast">
          <div>Toast content</div>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('border', 'bg-background', 'text-foreground');
  });

  it('renders with destructive variant', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast" variant="destructive">
          <div>Destructive toast</div>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('destructive', 'border-destructive', 'bg-destructive', 'text-destructive-foreground');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLLIElement>();
    render(
      <ToastProvider>
        <Toast ref={ref}>
          <div>Toast content</div>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('applies custom className', () => {
    render(
      <ToastProvider>
        <Toast className="custom-class" data-testid="toast">
          <div>Toast content</div>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByTestId('toast')).toHaveClass('custom-class');
  });

  it('has base styling classes', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast">
          <div>Toast content</div>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('group', 'pointer-events-auto', 'relative', 'flex', 'w-full', 'items-center', 'rounded-md', 'p-4', 'shadow-lg');
  });

  it('renders children', () => {
    render(
      <ToastProvider>
        <Toast>
          <div data-testid="content">Custom content</div>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});

describe('ToastTitle', () => {
  it('renders title text', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle>Toast Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByText('Toast Title')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle ref={ref}>Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('applies custom className', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle className="custom-title" data-testid="title">Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByTestId('title')).toHaveClass('custom-title');
  });

  it('has default styling', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle data-testid="title">Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const title = screen.getByTestId('title');
    expect(title).toHaveClass('text-sm', 'font-semibold');
  });
});

describe('ToastDescription', () => {
  it('renders description text', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastDescription>Toast description text</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByText('Toast description text')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ToastProvider>
        <Toast>
          <ToastDescription ref={ref}>Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('applies custom className', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastDescription className="custom-description" data-testid="description">
            Description
          </ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByTestId('description')).toHaveClass('custom-description');
  });

  it('has default styling', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastDescription data-testid="description">Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const description = screen.getByTestId('description');
    expect(description).toHaveClass('text-sm', 'opacity-90');
  });
});

describe('ToastClose', () => {
  it('renders a close button', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastClose data-testid="close" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const closeButton = screen.getByTestId('close');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton.tagName.toLowerCase()).toBe('button');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <ToastProvider>
        <Toast>
          <ToastClose ref={ref} />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('applies custom className', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastClose className="custom-close" data-testid="close" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByTestId('close')).toHaveClass('custom-close');
  });

  it('has toast-close attribute', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastClose data-testid="close" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByTestId('close')).toHaveAttribute('toast-close');
  });

  it('contains an icon', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastClose data-testid="close" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const closeButton = screen.getByTestId('close');
    expect(closeButton.querySelector('svg')).toBeInTheDocument();
  });

  it('has default positioning and styling', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastClose data-testid="close" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const closeButton = screen.getByTestId('close');
    expect(closeButton).toHaveClass('absolute', 'right-1', 'top-1', 'rounded-md', 'p-1');
  });
});

describe('ToastAction', () => {
  it('renders an action button', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastAction altText="Try again" data-testid="action">
            Try again
          </ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const action = screen.getByTestId('action');
    expect(action).toBeInTheDocument();
    expect(action).toHaveTextContent('Try again');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <ToastProvider>
        <Toast>
          <ToastAction ref={ref} altText="Action">Action</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('applies custom className', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastAction altText="Action" className="custom-action" data-testid="action">
            Action
          </ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByTestId('action')).toHaveClass('custom-action');
  });

  it('has default button styling', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastAction altText="Action" data-testid="action">Action</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const action = screen.getByTestId('action');
    expect(action).toHaveClass('inline-flex', 'h-8', 'shrink-0', 'items-center', 'justify-center', 'rounded-md', 'border', 'px-3', 'text-sm', 'font-medium');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(
      <ToastProvider>
        <Toast>
          <ToastAction altText="Action" onClick={onClick} data-testid="action">
            Click me
          </ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    fireEvent.click(screen.getByTestId('action'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('Toast integration', () => {
  it('renders a complete toast with all components', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast">
          <div className="grid gap-1">
            <ToastTitle>Notification</ToastTitle>
            <ToastDescription>This is a toast notification.</ToastDescription>
          </div>
          <ToastAction altText="Undo">Undo</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    expect(screen.getByText('Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a toast notification.')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByTestId('toast').querySelector('[toast-close]')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast-1">
          <ToastTitle>Toast 1</ToastTitle>
        </Toast>
        <Toast data-testid="toast-2">
          <ToastTitle>Toast 2</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });

  it('renders destructive toast with appropriate styling', () => {
    render(
      <ToastProvider>
        <Toast variant="destructive" data-testid="toast">
          <ToastTitle>Error</ToastTitle>
          <ToastDescription>Something went wrong!</ToastDescription>
          <ToastClose data-testid="close" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('destructive');
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });

  it('passes additional props to Toast', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast" aria-label="Custom toast" role="alert">
          <ToastTitle>Custom Props</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveAttribute('aria-label', 'Custom toast');
    expect(toast).toHaveAttribute('role', 'alert');
  });
});
