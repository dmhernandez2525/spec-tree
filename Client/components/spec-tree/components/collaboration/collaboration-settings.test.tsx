import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CollaborationSettings from './collaboration-settings';
import { setEnabled, setMode } from '@/lib/store/collaboration-slice';

const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => mockUseSelector(selector),
}));

describe('CollaborationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles collaboration enabled state', async () => {
    const mockState = {
      collaboration: {
        isEnabled: true,
        mode: 'edit',
        activity: [],
      },
    };

    mockUseSelector.mockImplementation((selector) => selector(mockState));

    render(<CollaborationSettings />);

    const toggle = screen.getByRole('switch', { name: 'Enable collaboration' });
    await userEvent.click(toggle);

    expect(mockDispatch).toHaveBeenCalledWith(setEnabled(false));
  });

  it('switches to read-only mode', async () => {
    const mockState = {
      collaboration: {
        isEnabled: true,
        mode: 'edit',
        activity: [],
      },
    };

    mockUseSelector.mockImplementation((selector) => selector(mockState));

    render(<CollaborationSettings />);

    const readOnlyButton = screen.getByRole('button', { name: 'Read-only' });
    await userEvent.click(readOnlyButton);

    expect(mockDispatch).toHaveBeenCalledWith(setMode('read-only'));
  });
});
