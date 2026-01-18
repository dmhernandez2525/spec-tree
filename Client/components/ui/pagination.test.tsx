import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './pagination';

describe('Pagination exports', () => {
  it('exports Pagination component', () => {
    expect(Pagination).toBeDefined();
    expect(Pagination.displayName).toBe('Pagination');
  });

  it('exports PaginationContent component', () => {
    expect(PaginationContent).toBeDefined();
    expect(PaginationContent.displayName).toBe('PaginationContent');
  });

  it('exports PaginationLink component', () => {
    expect(PaginationLink).toBeDefined();
    expect(PaginationLink.displayName).toBe('PaginationLink');
  });

  it('exports PaginationItem component', () => {
    expect(PaginationItem).toBeDefined();
    expect(PaginationItem.displayName).toBe('PaginationItem');
  });

  it('exports PaginationPrevious component', () => {
    expect(PaginationPrevious).toBeDefined();
    expect(PaginationPrevious.displayName).toBe('PaginationPrevious');
  });

  it('exports PaginationNext component', () => {
    expect(PaginationNext).toBeDefined();
    expect(PaginationNext.displayName).toBe('PaginationNext');
  });

  it('exports PaginationEllipsis component', () => {
    expect(PaginationEllipsis).toBeDefined();
    expect(PaginationEllipsis.displayName).toBe('PaginationEllipsis');
  });
});

describe('Pagination', () => {
  it('renders with navigation role', () => {
    render(
      <Pagination data-testid="pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'pagination');
  });

  it('applies custom className', () => {
    render(
      <Pagination className="custom-pagination" data-testid="pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByTestId('pagination')).toHaveClass('custom-pagination');
  });
});

describe('PaginationPrevious', () => {
  it('renders previous button', () => {
    render(<PaginationPrevious href="#" />);

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
  });
});

describe('PaginationNext', () => {
  it('renders next button', () => {
    render(<PaginationNext href="#" />);

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });
});

describe('PaginationEllipsis', () => {
  it('renders ellipsis', () => {
    render(<PaginationEllipsis data-testid="ellipsis" />);

    expect(screen.getByTestId('ellipsis')).toBeInTheDocument();
    expect(screen.getByText('More pages')).toBeInTheDocument();
  });
});
