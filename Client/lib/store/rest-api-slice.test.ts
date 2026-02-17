import { describe, it, expect } from 'vitest';
import restApiReducer, { setUsageStats, clearError } from './rest-api-slice';
import type { RestApiState, ApiUsageStats } from '@/types/rest-api';

describe('rest-api-slice', () => {
  const initialState: RestApiState = {
    keys: [],
    usage: null,
    usageHistory: [],
    isLoading: false,
    error: null,
  };

  it('returns initial state', () => {
    const state = restApiReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('sets usage stats', () => {
    const stats: ApiUsageStats = {
      totalRequests: 100,
      errorCount: 5,
      avgLatencyMs: 45,
      requestsByEndpoint: { '/specs': 80, '/epics': 20 },
      requestsByStatus: { '200': 95, '500': 5 },
      requestsByDay: [{ date: '2026-02-15', count: 100 }],
    };
    const state = restApiReducer(initialState, setUsageStats(stats));
    expect(state.usage).toEqual(stats);
  });

  it('clears error', () => {
    const stateWithError: RestApiState = { ...initialState, error: 'Something went wrong' };
    const state = restApiReducer(stateWithError, clearError());
    expect(state.error).toBeNull();
  });
});
