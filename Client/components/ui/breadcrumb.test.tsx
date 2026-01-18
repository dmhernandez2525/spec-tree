import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';

describe('Breadcrumb', () => {
  it('renders nav element', () => {
    render(<Breadcrumb data-testid="breadcrumb" />);

    const nav = screen.getByTestId('breadcrumb');
    expect(nav).toBeInTheDocument();
    expect(nav.tagName.toLowerCase()).toBe('nav');
  });

  it('has correct aria-label', () => {
    render(<Breadcrumb data-testid="breadcrumb" />);

    const nav = screen.getByTestId('breadcrumb');
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Breadcrumb ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Breadcrumb.displayName).toBe('Breadcrumb');
  });
});

describe('BreadcrumbList', () => {
  it('renders ol element', () => {
    render(<BreadcrumbList data-testid="list" />);

    const list = screen.getByTestId('list');
    expect(list).toBeInTheDocument();
    expect(list.tagName.toLowerCase()).toBe('ol');
  });

  it('applies default styles', () => {
    render(<BreadcrumbList data-testid="list" />);

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('flex');
    expect(list).toHaveClass('flex-wrap');
    expect(list).toHaveClass('items-center');
    expect(list).toHaveClass('gap-1.5');
    expect(list).toHaveClass('text-sm');
    expect(list).toHaveClass('text-muted-foreground');
  });

  it('accepts custom className', () => {
    render(<BreadcrumbList data-testid="list" className="custom-class" />);

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<BreadcrumbList ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(BreadcrumbList.displayName).toBe('BreadcrumbList');
  });
});

describe('BreadcrumbItem', () => {
  it('renders li element', () => {
    render(
      <ul>
        <BreadcrumbItem data-testid="item">Item</BreadcrumbItem>
      </ul>
    );

    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();
    expect(item.tagName.toLowerCase()).toBe('li');
  });

  it('applies default styles', () => {
    render(
      <ul>
        <BreadcrumbItem data-testid="item">Item</BreadcrumbItem>
      </ul>
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('inline-flex');
    expect(item).toHaveClass('items-center');
    expect(item).toHaveClass('gap-1.5');
  });

  it('accepts custom className', () => {
    render(
      <ul>
        <BreadcrumbItem data-testid="item" className="custom-class">
          Item
        </BreadcrumbItem>
      </ul>
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <ul>
        <BreadcrumbItem ref={ref}>Item</BreadcrumbItem>
      </ul>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(BreadcrumbItem.displayName).toBe('BreadcrumbItem');
  });
});

describe('BreadcrumbLink', () => {
  it('renders anchor element by default', () => {
    render(<BreadcrumbLink href="/test">Link</BreadcrumbLink>);

    const link = screen.getByText('Link');
    expect(link.tagName.toLowerCase()).toBe('a');
  });

  it('applies default styles', () => {
    render(
      <BreadcrumbLink href="/test" data-testid="link">
        Link
      </BreadcrumbLink>
    );

    const link = screen.getByTestId('link');
    expect(link).toHaveClass('transition-colors');
  });

  it('accepts custom className', () => {
    render(
      <BreadcrumbLink href="/test" data-testid="link" className="custom-class">
        Link
      </BreadcrumbLink>
    );

    const link = screen.getByTestId('link');
    expect(link).toHaveClass('custom-class');
  });

  it('renders child element when asChild is true', () => {
    render(
      <BreadcrumbLink asChild>
        <span data-testid="custom-link">Custom Link</span>
      </BreadcrumbLink>
    );

    const link = screen.getByTestId('custom-link');
    expect(link.tagName.toLowerCase()).toBe('span');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<BreadcrumbLink ref={ref} href="/test">Link</BreadcrumbLink>);
    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(BreadcrumbLink.displayName).toBe('BreadcrumbLink');
  });
});

describe('BreadcrumbPage', () => {
  it('renders span element', () => {
    render(<BreadcrumbPage data-testid="page">Current Page</BreadcrumbPage>);

    const page = screen.getByTestId('page');
    expect(page).toBeInTheDocument();
    expect(page.tagName.toLowerCase()).toBe('span');
  });

  it('has correct aria attributes', () => {
    render(<BreadcrumbPage data-testid="page">Current Page</BreadcrumbPage>);

    const page = screen.getByTestId('page');
    expect(page).toHaveAttribute('role', 'link');
    expect(page).toHaveAttribute('aria-disabled', 'true');
    expect(page).toHaveAttribute('aria-current', 'page');
  });

  it('applies default styles', () => {
    render(<BreadcrumbPage data-testid="page">Current Page</BreadcrumbPage>);

    const page = screen.getByTestId('page');
    expect(page).toHaveClass('font-normal');
    expect(page).toHaveClass('text-foreground');
  });

  it('accepts custom className', () => {
    render(
      <BreadcrumbPage data-testid="page" className="custom-class">
        Current Page
      </BreadcrumbPage>
    );

    const page = screen.getByTestId('page');
    expect(page).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<BreadcrumbPage ref={ref}>Page</BreadcrumbPage>);
    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(BreadcrumbPage.displayName).toBe('BreadcrumbPage');
  });
});

describe('BreadcrumbSeparator', () => {
  it('renders li element', () => {
    render(
      <ul>
        <BreadcrumbSeparator data-testid="separator" />
      </ul>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator.tagName.toLowerCase()).toBe('li');
  });

  it('has correct aria attributes', () => {
    render(
      <ul>
        <BreadcrumbSeparator data-testid="separator" />
      </ul>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'presentation');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders default chevron icon', () => {
    const { container } = render(
      <ul>
        <BreadcrumbSeparator data-testid="separator" />
      </ul>
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('accepts custom separator', () => {
    render(
      <ul>
        <BreadcrumbSeparator data-testid="separator">/</BreadcrumbSeparator>
      </ul>
    );

    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(
      <ul>
        <BreadcrumbSeparator data-testid="separator" className="custom-class" />
      </ul>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(BreadcrumbSeparator.displayName).toBe('BreadcrumbSeparator');
  });
});

describe('BreadcrumbEllipsis', () => {
  it('renders span element', () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);

    const ellipsis = screen.getByTestId('ellipsis');
    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis.tagName.toLowerCase()).toBe('span');
  });

  it('has correct aria attributes', () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);

    const ellipsis = screen.getByTestId('ellipsis');
    expect(ellipsis).toHaveAttribute('role', 'presentation');
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies default styles', () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);

    const ellipsis = screen.getByTestId('ellipsis');
    expect(ellipsis).toHaveClass('flex');
    expect(ellipsis).toHaveClass('h-9');
    expect(ellipsis).toHaveClass('w-9');
    expect(ellipsis).toHaveClass('items-center');
    expect(ellipsis).toHaveClass('justify-center');
  });

  it('has screen reader text', () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);

    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByText('More')).toHaveClass('sr-only');
  });

  it('renders dots icon', () => {
    const { container } = render(<BreadcrumbEllipsis />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-4');
    expect(icon).toHaveClass('w-4');
  });

  it('accepts custom className', () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" className="custom-class" />);

    const ellipsis = screen.getByTestId('ellipsis');
    expect(ellipsis).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(BreadcrumbEllipsis.displayName).toBe('BreadcrumbElipssis');
  });
});

describe('Breadcrumb composition', () => {
  it('renders complete breadcrumb', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });
});
