import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

describe('Table', () => {
  it('renders a table element', () => {
    render(<Table data-testid="table" />);

    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();
    expect(table.tagName.toLowerCase()).toBe('table');
  });

  it('applies default styles', () => {
    render(<Table data-testid="table" />);

    const table = screen.getByTestId('table');
    expect(table).toHaveClass('w-full');
    expect(table).toHaveClass('caption-bottom');
    expect(table).toHaveClass('text-sm');
  });

  it('is wrapped in a scrollable container', () => {
    render(<Table data-testid="table" />);

    const table = screen.getByTestId('table');
    const wrapper = table.parentElement;
    expect(wrapper).toHaveClass('relative');
    expect(wrapper).toHaveClass('w-full');
    expect(wrapper).toHaveClass('overflow-auto');
  });

  it('accepts custom className', () => {
    render(<Table data-testid="table" className="custom-class" />);

    const table = screen.getByTestId('table');
    expect(table).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Table ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Table.displayName).toBe('Table');
  });
});

describe('TableHeader', () => {
  it('renders a thead element', () => {
    render(
      <table>
        <TableHeader data-testid="header" />
      </table>
    );

    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
    expect(header.tagName.toLowerCase()).toBe('thead');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <TableHeader ref={ref} />
      </table>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TableHeader.displayName).toBe('TableHeader');
  });
});

describe('TableBody', () => {
  it('renders a tbody element', () => {
    render(
      <table>
        <TableBody data-testid="body" />
      </table>
    );

    const body = screen.getByTestId('body');
    expect(body).toBeInTheDocument();
    expect(body.tagName.toLowerCase()).toBe('tbody');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <TableBody ref={ref} />
      </table>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TableBody.displayName).toBe('TableBody');
  });
});

describe('TableFooter', () => {
  it('renders a tfoot element', () => {
    render(
      <table>
        <TableFooter data-testid="footer" />
      </table>
    );

    const footer = screen.getByTestId('footer');
    expect(footer).toBeInTheDocument();
    expect(footer.tagName.toLowerCase()).toBe('tfoot');
  });

  it('applies default styles', () => {
    render(
      <table>
        <TableFooter data-testid="footer" />
      </table>
    );

    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('border-t');
    expect(footer).toHaveClass('bg-muted/50');
    expect(footer).toHaveClass('font-medium');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <TableFooter ref={ref} />
      </table>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TableFooter.displayName).toBe('TableFooter');
  });
});

describe('TableRow', () => {
  it('renders a tr element', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="row" />
        </tbody>
      </table>
    );

    const row = screen.getByTestId('row');
    expect(row).toBeInTheDocument();
    expect(row.tagName.toLowerCase()).toBe('tr');
  });

  it('applies default styles', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="row" />
        </tbody>
      </table>
    );

    const row = screen.getByTestId('row');
    expect(row).toHaveClass('border-b');
    expect(row).toHaveClass('transition-colors');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <tbody>
          <TableRow ref={ref} />
        </tbody>
      </table>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TableRow.displayName).toBe('TableRow');
  });
});

describe('TableHead', () => {
  it('renders a th element', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead data-testid="head">Header</TableHead>
          </tr>
        </thead>
      </table>
    );

    const head = screen.getByTestId('head');
    expect(head).toBeInTheDocument();
    expect(head.tagName.toLowerCase()).toBe('th');
  });

  it('applies default styles', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead data-testid="head">Header</TableHead>
          </tr>
        </thead>
      </table>
    );

    const head = screen.getByTestId('head');
    expect(head).toHaveClass('h-10');
    expect(head).toHaveClass('px-2');
    expect(head).toHaveClass('text-left');
    expect(head).toHaveClass('font-medium');
    expect(head).toHaveClass('text-muted-foreground');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <TableHead ref={ref}>Header</TableHead>
          </tr>
        </thead>
      </table>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TableHead.displayName).toBe('TableHead');
  });
});

describe('TableCell', () => {
  it('renders a td element', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="cell">Cell</TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('cell');
    expect(cell).toBeInTheDocument();
    expect(cell.tagName.toLowerCase()).toBe('td');
  });

  it('applies default styles', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="cell">Cell</TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('cell');
    expect(cell).toHaveClass('p-2');
    expect(cell).toHaveClass('align-middle');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <tbody>
          <tr>
            <TableCell ref={ref}>Cell</TableCell>
          </tr>
        </tbody>
      </table>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TableCell.displayName).toBe('TableCell');
  });
});

describe('TableCaption', () => {
  it('renders a caption element', () => {
    render(
      <table>
        <TableCaption data-testid="caption">Caption</TableCaption>
      </table>
    );

    const caption = screen.getByTestId('caption');
    expect(caption).toBeInTheDocument();
    expect(caption.tagName.toLowerCase()).toBe('caption');
  });

  it('applies default styles', () => {
    render(
      <table>
        <TableCaption data-testid="caption">Caption</TableCaption>
      </table>
    );

    const caption = screen.getByTestId('caption');
    expect(caption).toHaveClass('mt-4');
    expect(caption).toHaveClass('text-sm');
    expect(caption).toHaveClass('text-muted-foreground');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <TableCaption ref={ref}>Caption</TableCaption>
      </table>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(TableCaption.displayName).toBe('TableCaption');
  });
});

describe('Table composition', () => {
  it('renders a complete table', () => {
    render(
      <Table>
        <TableCaption>A list of recent invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>$250.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>INV002</TableCell>
            <TableCell>Pending</TableCell>
            <TableCell>$150.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell>$400.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('A list of recent invoices')).toBeInTheDocument();
    expect(screen.getByText('Invoice')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('INV001')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('$250.00')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
  });
});
