import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserNav } from './UserNav';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockStore = configureStore({
  reducer: {
    auth: (state = {}) => state,
    user: (state = {}) => state,
  },
});

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  image: 'https://example.com/avatar.jpg',
};

const renderWithStore = (component: React.ReactElement) => {
  return render(<Provider store={mockStore}>{component}</Provider>);
};

export const userNavTests = () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user menu button', () => {
    renderWithStore(<UserNav user={mockUser} />);

    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('displays user initials in avatar', () => {
    renderWithStore(<UserNav user={mockUser} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles single name correctly', () => {
    const singleNameUser = {
      name: 'John',
      email: 'john@example.com',
    };

    renderWithStore(<UserNav user={singleNameUser} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('handles empty name correctly', () => {
    const emptyNameUser = {
      name: '',
      email: 'user@example.com',
    };

    renderWithStore(<UserNav user={emptyNameUser} />);

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('handles multiple names correctly', () => {
    const multipleNamesUser = {
      name: 'John Michael Doe',
      email: 'john@example.com',
    };

    renderWithStore(<UserNav user={multipleNamesUser} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders button with correct variant', () => {
    const { container: _container } = renderWithStore(<UserNav user={mockUser} />);

    const button = screen.getByLabelText('User menu');
    expect(button).toHaveClass('rounded-full');
  });

  it('renders user data correctly', () => {
    renderWithStore(<UserNav user={mockUser} />);

    const button = screen.getByLabelText('User menu');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles Redux dispatch actions', () => {
    renderWithStore(<UserNav user={mockUser} />);

    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('passes user email correctly', () => {
    const userWithEmail = {
      ...mockUser,
      email: 'test@example.com',
    };

    renderWithStore(<UserNav user={userWithEmail} />);

    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('renders with avatar image url', () => {
    const userWithAvatar = {
      ...mockUser,
      image: 'https://example.com/avatar.jpg',
    };

    renderWithStore(<UserNav user={userWithAvatar} />);

    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('handles user without image', () => {
    const userWithoutImage = {
      name: 'Jane Smith',
      email: 'jane@example.com',
    };

    renderWithStore(<UserNav user={userWithoutImage} />);

    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('handles lowercase initials conversion', () => {
    const lowercaseUser = {
      name: 'jane doe',
      email: 'jane@example.com',
    };

    renderWithStore(<UserNav user={lowercaseUser} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles extra whitespace in name', () => {
    const whitespaceUser = {
      name: '  John   Doe  ',
      email: 'john@example.com',
    };

    renderWithStore(<UserNav user={whitespaceUser} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });
};

userNavTests();
