import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobDetails } from './JobDetails';

describe('JobDetails', () => {
  const mockJob = {
    id: 'job-123',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    department: 'Engineering',
    description: 'We are looking for a skilled software engineer to join our team.',
    requirements: [
      '5+ years of experience',
      'React and TypeScript expertise',
      'Strong communication skills',
    ],
  };

  const mockOnClose = vi.fn();
  const mockOnApply = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be imported', () => {
    expect(JobDetails).toBeDefined();
    expect(typeof JobDetails).toBe('function');
  });

  it('renders job title', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
  });

  it('renders job location and department', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(screen.getByText(/San Francisco, CA/)).toBeInTheDocument();
    expect(screen.getByText(/Engineering/)).toBeInTheDocument();
  });

  it('renders job description', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(
      screen.getByText('We are looking for a skilled software engineer to join our team.')
    ).toBeInTheDocument();
  });

  it('renders Requirements heading', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(screen.getByText('Requirements')).toBeInTheDocument();
  });

  it('renders all job requirements', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(screen.getByText('5+ years of experience')).toBeInTheDocument();
    expect(screen.getByText('React and TypeScript expertise')).toBeInTheDocument();
    expect(screen.getByText('Strong communication skills')).toBeInTheDocument();
  });

  it('renders Close button', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('renders Apply Now button', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(screen.getByRole('button', { name: 'Apply Now' })).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onApply with job id when Apply Now button is clicked', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    const applyButton = screen.getByRole('button', { name: 'Apply Now' });
    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledTimes(1);
    expect(mockOnApply).toHaveBeenCalledWith('job-123');
  });

  it('renders requirements as list items', () => {
    render(<JobDetails job={mockJob} onClose={mockOnClose} onApply={mockOnApply} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });
});
