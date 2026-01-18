import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';

describe('Card', () => {
  it('renders a card element', () => {
    render(<Card data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card.tagName.toLowerCase()).toBe('div');
  });

  it('applies default styles', () => {
    render(<Card data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('shadow');
  });

  it('accepts custom className', () => {
    render(<Card data-testid="card" className="custom-class">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(Card.displayName).toBe('Card');
  });
});

describe('CardHeader', () => {
  it('renders a header section', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);

    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
    expect(header.tagName.toLowerCase()).toBe('div');
  });

  it('applies default styles', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('space-y-1.5');
    expect(header).toHaveClass('p-6');
  });

  it('accepts custom className', () => {
    render(<CardHeader data-testid="header" className="custom-class">Header</CardHeader>);

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardHeader ref={ref}>Header</CardHeader>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(CardHeader.displayName).toBe('CardHeader');
  });
});

describe('CardTitle', () => {
  it('renders a title heading', () => {
    render(<CardTitle>Title</CardTitle>);

    const title = screen.getByText('Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName.toLowerCase()).toBe('h3');
  });

  it('applies default styles', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);

    const title = screen.getByTestId('title');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('leading-none');
    expect(title).toHaveClass('tracking-tight');
  });

  it('accepts custom className', () => {
    render(<CardTitle data-testid="title" className="custom-class">Title</CardTitle>);

    const title = screen.getByTestId('title');
    expect(title).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardTitle ref={ref}>Title</CardTitle>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(CardTitle.displayName).toBe('CardTitle');
  });
});

describe('CardDescription', () => {
  it('renders a description paragraph', () => {
    render(<CardDescription>Description</CardDescription>);

    const desc = screen.getByText('Description');
    expect(desc).toBeInTheDocument();
    expect(desc.tagName.toLowerCase()).toBe('p');
  });

  it('applies default styles', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);

    const desc = screen.getByTestId('desc');
    expect(desc).toHaveClass('text-sm');
    expect(desc).toHaveClass('text-muted-foreground');
  });

  it('accepts custom className', () => {
    render(<CardDescription data-testid="desc" className="custom-class">Description</CardDescription>);

    const desc = screen.getByTestId('desc');
    expect(desc).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardDescription ref={ref}>Description</CardDescription>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(CardDescription.displayName).toBe('CardDescription');
  });
});

describe('CardContent', () => {
  it('renders content section', () => {
    render(<CardContent data-testid="content">Content</CardContent>);

    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
    expect(content.tagName.toLowerCase()).toBe('div');
  });

  it('applies default styles', () => {
    render(<CardContent data-testid="content">Content</CardContent>);

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('p-6');
    expect(content).toHaveClass('pt-0');
  });

  it('accepts custom className', () => {
    render(<CardContent data-testid="content" className="custom-class">Content</CardContent>);

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardContent ref={ref}>Content</CardContent>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(CardContent.displayName).toBe('CardContent');
  });
});

describe('CardFooter', () => {
  it('renders footer section', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);

    const footer = screen.getByTestId('footer');
    expect(footer).toBeInTheDocument();
    expect(footer.tagName.toLowerCase()).toBe('div');
  });

  it('applies default styles', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);

    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
    expect(footer).toHaveClass('p-6');
    expect(footer).toHaveClass('pt-0');
  });

  it('accepts custom className', () => {
    render(<CardFooter data-testid="footer" className="custom-class">Footer</CardFooter>);

    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardFooter ref={ref}>Footer</CardFooter>);

    expect(ref).toHaveBeenCalled();
  });

  it('has correct displayName', () => {
    expect(CardFooter.displayName).toBe('CardFooter');
  });
});

describe('Card composition', () => {
  it('renders a complete card with all subcomponents', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card content goes here</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });
});
