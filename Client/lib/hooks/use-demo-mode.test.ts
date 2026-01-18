import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock dispatch
const mockDispatch = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) =>
    selector({
      demo: {
        user: {
          isDemoMode: true,
          demoLevel: 'advanced',
          enabledFeatures: ['mock_data', 'sample_projects'],
          activeScenario: 'startup',
        },
        config: { testConfig: true },
      },
    }),
}));

vi.mock('../store/demo-slice', () => ({
  toggleDemoMode: vi.fn(() => ({ type: 'demo/toggleDemoMode' })),
  setDemoLevel: vi.fn((level: string) => ({ type: 'demo/setDemoLevel', payload: level })),
  setActiveScenario: vi.fn((scenario: string | null) => ({
    type: 'demo/setActiveScenario',
    payload: scenario,
  })),
  toggleFeature: vi.fn((args: { feature: string; enabled: boolean }) => ({
    type: 'demo/toggleFeature',
    payload: args,
  })),
  loadDemoSettings: vi.fn(() => ({ type: 'demo/loadDemoSettings' })),
  resetDemoSettings: vi.fn(() => ({ type: 'demo/resetDemoSettings' })),
  DEMO_SCENARIOS: {
    startup: {
      name: 'Startup',
      description: 'Startup scenario',
      features: ['mock_data'],
    },
    enterprise: {
      name: 'Enterprise',
      description: 'Enterprise scenario',
      features: ['sample_projects'],
    },
  },
}));

import { useDemoMode } from './use-demo-mode';

describe('useDemoMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns demo state values', () => {
    const { result } = renderHook(() => useDemoMode());

    expect(result.current.isDemoMode).toBe(true);
    expect(result.current.demoLevel).toBe('advanced');
    expect(result.current.enabledFeatures).toEqual(['mock_data', 'sample_projects']);
    expect(result.current.activeScenario).toBe('startup');
    expect(result.current.config).toEqual({ testConfig: true });
  });

  it('dispatches loadDemoSettings on mount', () => {
    renderHook(() => useDemoMode());

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'demo/loadDemoSettings' });
  });

  it('hasFeature returns true for enabled features', () => {
    const { result } = renderHook(() => useDemoMode());

    expect(result.current.hasFeature('mock_data' as any)).toBe(true);
    expect(result.current.hasFeature('sample_projects' as any)).toBe(true);
  });

  it('hasFeature returns false for disabled features', () => {
    const { result } = renderHook(() => useDemoMode());

    expect(result.current.hasFeature('unknown_feature' as any)).toBe(false);
  });

  it('hasLevel returns true for levels at or below current level', () => {
    const { result } = renderHook(() => useDemoMode());

    expect(result.current.hasLevel('basic')).toBe(true);
    expect(result.current.hasLevel('advanced')).toBe(true);
  });

  it('hasLevel returns false for levels above current level', () => {
    const { result } = renderHook(() => useDemoMode());

    expect(result.current.hasLevel('developer')).toBe(false);
  });

  it('getScenarioInfo returns scenario details', () => {
    const { result } = renderHook(() => useDemoMode());

    const scenarioInfo = result.current.getScenarioInfo('startup' as any);
    expect(scenarioInfo).toEqual({
      name: 'Startup',
      description: 'Startup scenario',
      features: ['mock_data'],
    });
  });

  it('getAvailableScenarios returns all scenarios', () => {
    const { result } = renderHook(() => useDemoMode());

    const scenarios = result.current.getAvailableScenarios();
    expect(scenarios).toHaveLength(2);
    expect(scenarios[0].id).toBe('startup');
    expect(scenarios[1].id).toBe('enterprise');
  });

  it('activeScenarioInfo returns current scenario info', () => {
    const { result } = renderHook(() => useDemoMode());

    expect(result.current.activeScenarioInfo).toEqual({
      name: 'Startup',
      description: 'Startup scenario',
      features: ['mock_data'],
    });
  });

  it('toggleDemo dispatches toggleDemoMode action', () => {
    const { result } = renderHook(() => useDemoMode());

    act(() => {
      result.current.toggleDemo();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'demo/toggleDemoMode' });
  });

  it('setLevel dispatches setDemoLevel action', () => {
    const { result } = renderHook(() => useDemoMode());

    act(() => {
      result.current.setLevel('developer');
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'demo/setDemoLevel',
      payload: 'developer',
    });
  });

  it('setScenario dispatches setActiveScenario action', () => {
    const { result } = renderHook(() => useDemoMode());

    act(() => {
      result.current.setScenario('enterprise' as any);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'demo/setActiveScenario',
      payload: 'enterprise',
    });
  });

  it('toggleDemoFeature dispatches toggleFeature action', () => {
    const { result } = renderHook(() => useDemoMode());

    act(() => {
      result.current.toggleDemoFeature('mock_data' as any, false);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'demo/toggleFeature',
      payload: { feature: 'mock_data', enabled: false },
    });
  });

  it('resetSettings dispatches resetDemoSettings action', () => {
    const { result } = renderHook(() => useDemoMode());

    act(() => {
      result.current.resetSettings();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'demo/resetDemoSettings' });
  });
});

// Note: Testing edge cases for null state and demo mode off
// would require re-mocking the module which doesn't work well with vitest
// The main functionality is covered by the tests above
