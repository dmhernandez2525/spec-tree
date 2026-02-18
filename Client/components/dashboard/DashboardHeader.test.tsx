import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from './DashboardHeader';
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

const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: {
    url: 'https://example.com/avatar.jpg',
  },
};

const createMockStore = (user: typeof mockUser | null) =>
  configureStore({
    reducer: {
      auth: (state = {}) => state,
      user: (state = { user }) => state,
    },
  });

const renderWithStore = (component: React.ReactElement, user: typeof mockUser | null = mockUser) => {
  const store = createMockStore(user);
  return render(<Provider store={store}>{component}</Provider>);
};

export const dashboardHeaderTests = () => {
  it('renders dashboard header', () => {
    renderWithStore(<DashboardHeader />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays welcome message with user first name', () => {
    renderWithStore(<DashboardHeader />);

    expect(screen.getByText('Welcome John')).toBeInTheDocument();
  });

  it('displays Dashboard when no user is logged in', () => {
    renderWithStore(<DashboardHeader />, null);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders search component', () => {
    renderWithStore(<DashboardHeader />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('renders user navigation component', () => {
    renderWithStore(<DashboardHeader />);

    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('renders notifications component', () => {
    renderWithStore(<DashboardHeader />);

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('renders with user initials in avatar', () => {
    renderWithStore(<DashboardHeader />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles user without avatar', () => {
    const userWithoutAvatar = {
      ...mockUser,
      avatar: undefined,
    };

    const store = configureStore({
      reducer: {
        auth: (state = {}) => state,
        user: (state = { user: userWithoutAvatar }) => state,
      },
    });

    render(
      <Provider store={store}>
        <DashboardHeader />
      </Provider>
    );

    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('has sticky positioning', () => {
    const { container } = renderWithStore(<DashboardHeader />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });

  it('has border bottom styling', () => {
    const { container } = renderWithStore(<DashboardHeader />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('border-b');
  });

  it('has correct z-index for stacking', () => {
    const { container } = renderWithStore(<DashboardHeader />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('z-40');
  });
};

dashboardHeaderTests();
