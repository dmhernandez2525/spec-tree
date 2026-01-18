import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientSuccess } from './ClientSuccess';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock components
vi.mock('@/components/shared/HeadingSection', () => ({
  HeadingSection: ({ heading, description }: { heading: string; description: string }) => (
    <div data-testid="heading-section">
      <h2>{heading}</h2>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/layout/Section', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="section">{children}</section>
  ),
}));

describe('ClientSuccess', () => {
  it('can be imported', () => {
    expect(ClientSuccess).toBeDefined();
    expect(typeof ClientSuccess).toBe('function');
  });

  it('renders the section wrapper', () => {
    render(<ClientSuccess />);

    expect(screen.getByTestId('section')).toBeInTheDocument();
  });

  it('renders the heading section with correct content', () => {
    render(<ClientSuccess />);

    expect(screen.getByTestId('heading-section')).toBeInTheDocument();
    expect(screen.getByText('Client Success Stories')).toBeInTheDocument();
    expect(
      screen.getByText('See how organizations are transforming their projects with Spec Tree')
    ).toBeInTheDocument();
  });

  it('renders success story cards', () => {
    render(<ClientSuccess />);

    expect(screen.getByText('TechCorp Solutions')).toBeInTheDocument();
    expect(screen.getByText('Global Marketing Agency')).toBeInTheDocument();
  });

  it('renders industry badges', () => {
    render(<ClientSuccess />);

    expect(screen.getByText('Software Development')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('renders story titles', () => {
    render(<ClientSuccess />);

    expect(screen.getByText('40% Faster Project Delivery')).toBeInTheDocument();
    expect(screen.getByText('50% Reduced Planning Time')).toBeInTheDocument();
  });

  it('renders quotes', () => {
    render(<ClientSuccess />);

    expect(
      screen.getByText(/Spec Tree transformed how we manage projects/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The contextual understanding and template system/)
    ).toBeInTheDocument();
  });

  it('renders quote authors and roles', () => {
    render(<ClientSuccess />);

    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Director of Engineering')).toBeInTheDocument();
    expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('Agency Director')).toBeInTheDocument();
  });

  it('renders result metrics', () => {
    render(<ClientSuccess />);

    expect(screen.getByText('-40%')).toBeInTheDocument();
    expect(screen.getByText('Planning Time')).toBeInTheDocument();
    expect(screen.getByText('+60%')).toBeInTheDocument();
    expect(screen.getByText('Team Productivity')).toBeInTheDocument();
  });

  it('renders read case study buttons', () => {
    render(<ClientSuccess />);

    const buttons = screen.getAllByText('Read Case Study');
    expect(buttons).toHaveLength(2);
  });

  it('renders company logos', () => {
    render(<ClientSuccess />);

    expect(screen.getByAltText('TechCorp Solutions')).toBeInTheDocument();
    expect(screen.getByAltText('Global Marketing Agency')).toBeInTheDocument();
  });

  it('renders links to case studies', () => {
    render(<ClientSuccess />);

    const links = screen.getAllByRole('link');
    expect(links.some(link => link.getAttribute('href')?.includes('techcorp'))).toBe(true);
    expect(links.some(link => link.getAttribute('href')?.includes('global-marketing'))).toBe(true);
  });
});
