import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TutorialTranscript } from './TutorialTranscript';

describe('TutorialTranscript', () => {
  it('renders the component', () => {
    render(<TutorialTranscript tutorialId="test-tutorial" />);

    expect(screen.getByText('Welcome to this Spec Tree tutorial.')).toBeInTheDocument();
  });

  it('renders transcript timestamps', () => {
    render(<TutorialTranscript tutorialId="test-tutorial" />);

    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('0:15')).toBeInTheDocument();
  });

  it('renders transcript content', () => {
    render(<TutorialTranscript tutorialId="test-tutorial" />);

    expect(screen.getByText('Welcome to this Spec Tree tutorial.')).toBeInTheDocument();
    expect(screen.getByText(/Today, we will be covering the basics/)).toBeInTheDocument();
  });

  it('renders within a Card component', () => {
    const { container } = render(<TutorialTranscript tutorialId="test-tutorial" />);

    const card = container.querySelector('[class*="rounded-xl"]');
    expect(card).toBeInTheDocument();
  });

  it('renders timestamps with muted styling', () => {
    render(<TutorialTranscript tutorialId="test-tutorial" />);

    const timestamp = screen.getByText('0:00');
    expect(timestamp).toHaveClass('text-sm');
    expect(timestamp).toHaveClass('text-muted-foreground');
  });

  it('renders with ScrollArea component', () => {
    const { container } = render(<TutorialTranscript tutorialId="test-tutorial" />);

    // ScrollArea should set a fixed height
    const scrollArea = container.querySelector('.h-\\[600px\\]');
    expect(scrollArea).toBeInTheDocument();
  });

  it('renders content within CardContent', () => {
    const { container } = render(<TutorialTranscript tutorialId="test-tutorial" />);

    const cardContent = container.querySelector('.p-6');
    expect(cardContent).toBeInTheDocument();
  });

  it('renders transcript entries with space between them', () => {
    const { container } = render(<TutorialTranscript tutorialId="test-tutorial" />);

    const spacedContainer = container.querySelector('.space-y-4');
    expect(spacedContainer).toBeInTheDocument();
  });

  it('renders transcript entries with gap between timestamp and text', () => {
    const { container } = render(<TutorialTranscript tutorialId="test-tutorial" />);

    const gapContainers = container.querySelectorAll('.gap-2');
    expect(gapContainers.length).toBeGreaterThanOrEqual(1);
  });

  it('accepts tutorialId prop', () => {
    // Component should render without errors with different tutorialIds
    const { rerender } = render(<TutorialTranscript tutorialId="tutorial-1" />);
    expect(screen.getByText('Welcome to this Spec Tree tutorial.')).toBeInTheDocument();

    rerender(<TutorialTranscript tutorialId="tutorial-2" />);
    expect(screen.getByText('Welcome to this Spec Tree tutorial.')).toBeInTheDocument();
  });

  it('renders transcript text in paragraph elements', () => {
    render(<TutorialTranscript tutorialId="test-tutorial" />);

    const welcomeText = screen.getByText('Welcome to this Spec Tree tutorial.');
    expect(welcomeText.tagName.toLowerCase()).toBe('p');
  });
});

describe('TutorialTranscript exports', () => {
  it('exports TutorialTranscript as a named export', () => {
    expect(TutorialTranscript).toBeDefined();
    expect(typeof TutorialTranscript).toBe('function');
  });
});
