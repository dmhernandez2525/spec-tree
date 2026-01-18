import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TutorialResources } from './TutorialResources';

describe('TutorialResources', () => {
  it('renders the component', () => {
    render(<TutorialResources tutorialId="test-tutorial" />);

    expect(screen.getByText('Downloadable Resources')).toBeInTheDocument();
  });

  it('renders all mock resources', () => {
    render(<TutorialResources tutorialId="test-tutorial" />);

    expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    expect(screen.getByText('Sample Project Files')).toBeInTheDocument();
    expect(screen.getByText('Example Code')).toBeInTheDocument();
  });

  it('renders resource sizes', () => {
    render(<TutorialResources tutorialId="test-tutorial" />);

    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
    expect(screen.getByText('4.1 MB')).toBeInTheDocument();
    expect(screen.getByText('156 KB')).toBeInTheDocument();
  });

  it('renders download buttons for each resource', () => {
    render(<TutorialResources tutorialId="test-tutorial" />);

    const downloadButtons = screen.getAllByRole('button', { name: 'Download' });
    expect(downloadButtons.length).toBe(3);
  });

  it('renders icons for each resource type', () => {
    const { container } = render(<TutorialResources tutorialId="test-tutorial" />);

    // Each resource should have an icon (SVG)
    const iconContainers = container.querySelectorAll('.rounded-lg.bg-muted');
    expect(iconContainers.length).toBe(3);
  });

  it('renders within a Card component', () => {
    const { container } = render(<TutorialResources tutorialId="test-tutorial" />);

    const card = container.querySelector('[class*="rounded-xl"]');
    expect(card).toBeInTheDocument();
  });

  it('renders heading with correct styling', () => {
    render(<TutorialResources tutorialId="test-tutorial" />);

    const heading = screen.getByText('Downloadable Resources');
    expect(heading).toHaveClass('font-semibold');
  });

  it('renders resource items with border', () => {
    const { container } = render(<TutorialResources tutorialId="test-tutorial" />);

    const resourceItems = container.querySelectorAll('.border');
    expect(resourceItems.length).toBeGreaterThanOrEqual(3);
  });

  it('renders resource titles with correct styling', () => {
    render(<TutorialResources tutorialId="test-tutorial" />);

    const title = screen.getByText('Getting Started Guide');
    expect(title).toHaveClass('font-medium');
  });

  it('renders resource sizes with muted styling', () => {
    render(<TutorialResources tutorialId="test-tutorial" />);

    const size = screen.getByText('2.4 MB');
    expect(size).toHaveClass('text-sm');
    expect(size).toHaveClass('text-muted-foreground');
  });

  it('accepts tutorialId prop', () => {
    // Component should render without errors with different tutorialIds
    const { rerender } = render(<TutorialResources tutorialId="tutorial-1" />);
    expect(screen.getByText('Downloadable Resources')).toBeInTheDocument();

    rerender(<TutorialResources tutorialId="tutorial-2" />);
    expect(screen.getByText('Downloadable Resources')).toBeInTheDocument();
  });

  it('renders download buttons with ghost variant and small size', () => {
    const { container } = render(<TutorialResources tutorialId="test-tutorial" />);

    // Ghost variant buttons should have specific classes
    const buttons = screen.getAllByRole('button', { name: 'Download' });
    buttons.forEach(button => {
      expect(button).toHaveClass('h-8'); // sm size
    });
  });
});

describe('TutorialResources exports', () => {
  it('exports TutorialResources as a named export', () => {
    expect(TutorialResources).toBeDefined();
    expect(typeof TutorialResources).toBe('function');
  });
});
