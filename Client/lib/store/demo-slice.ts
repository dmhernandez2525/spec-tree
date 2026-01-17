import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Demo feature flags
export type DemoFeature =
  | 'mock-data'
  | 'mock-subscriptions'
  | 'mock-analytics'
  | 'mock-billing'
  | 'mock-ai-responses'
  | 'debug-panels'
  | 'api-testing';

// Demo scenario types
export type DemoScenario =
  | 'solo-developer'
  | 'small-team'
  | 'enterprise'
  | 'free-tier'
  | 'pro-tier';

// Demo level determines which features are available
export type DemoLevel = 'basic' | 'advanced' | 'developer';

interface DemoUser {
  isDemoMode: boolean;
  demoLevel: DemoLevel;
  enabledFeatures: DemoFeature[];
  activeScenario: DemoScenario | null;
  lastToggled?: number;
}

interface DemoConfig {
  enabled: boolean;
  showInProduction: boolean;
  defaultLevel: DemoLevel;
  allowToggle: boolean;
  persistSettings: boolean;
}

interface DemoState {
  user: DemoUser;
  config: DemoConfig;
}

// Default features for each level
const basicFeatures: DemoFeature[] = ['mock-data', 'mock-subscriptions'];
const advancedFeatures: DemoFeature[] = [
  ...basicFeatures,
  'mock-analytics',
  'mock-billing',
  'mock-ai-responses',
];
const developerFeatures: DemoFeature[] = [
  ...advancedFeatures,
  'debug-panels',
  'api-testing',
];

const initialState: DemoState = {
  user: {
    isDemoMode: process.env.NODE_ENV === 'development',
    demoLevel: 'basic',
    enabledFeatures: basicFeatures,
    activeScenario: null,
  },
  config: {
    enabled: true,
    showInProduction: false,
    defaultLevel: 'basic',
    allowToggle: true,
    persistSettings: true,
  },
};

// Scenario presets with mock data configurations
export const DEMO_SCENARIOS: Record<
  DemoScenario,
  { name: string; description: string; tier: string }
> = {
  'solo-developer': {
    name: 'Solo Developer',
    description: 'Individual developer working on personal projects',
    tier: 'free',
  },
  'small-team': {
    name: 'Small Team',
    description: 'Team of 2-10 developers collaborating',
    tier: 'pro',
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Large organization with SSO and advanced features',
    tier: 'enterprise',
  },
  'free-tier': {
    name: 'Free Tier User',
    description: 'User on free plan with limited features',
    tier: 'free',
  },
  'pro-tier': {
    name: 'Pro Tier User',
    description: 'User on pro plan with full features',
    tier: 'pro',
  },
};

const demoSlice = createSlice({
  name: 'demo',
  initialState,
  reducers: {
    toggleDemoMode: (state) => {
      state.user.isDemoMode = !state.user.isDemoMode;
      state.user.lastToggled = Date.now();

      if (state.config.persistSettings && typeof window !== 'undefined') {
        localStorage.setItem('spectree-demo-mode', JSON.stringify(state.user));
      }
    },

    setDemoLevel: (state, action: PayloadAction<DemoLevel>) => {
      state.user.demoLevel = action.payload;

      // Update enabled features based on level
      switch (action.payload) {
        case 'basic':
          state.user.enabledFeatures = basicFeatures;
          break;
        case 'advanced':
          state.user.enabledFeatures = advancedFeatures;
          break;
        case 'developer':
          state.user.enabledFeatures = developerFeatures;
          break;
      }

      if (state.config.persistSettings && typeof window !== 'undefined') {
        localStorage.setItem('spectree-demo-mode', JSON.stringify(state.user));
      }
    },

    setActiveScenario: (state, action: PayloadAction<DemoScenario | null>) => {
      state.user.activeScenario = action.payload;

      if (state.config.persistSettings && typeof window !== 'undefined') {
        localStorage.setItem('spectree-demo-mode', JSON.stringify(state.user));
      }
    },

    toggleFeature: (
      state,
      action: PayloadAction<{ feature: DemoFeature; enabled: boolean }>
    ) => {
      const { feature, enabled } = action.payload;

      if (enabled && !state.user.enabledFeatures.includes(feature)) {
        state.user.enabledFeatures.push(feature);
      } else if (!enabled) {
        state.user.enabledFeatures = state.user.enabledFeatures.filter(
          (f) => f !== feature
        );
      }

      if (state.config.persistSettings && typeof window !== 'undefined') {
        localStorage.setItem('spectree-demo-mode', JSON.stringify(state.user));
      }
    },

    loadDemoSettings: (state) => {
      if (state.config.persistSettings && typeof window !== 'undefined') {
        const saved = localStorage.getItem('spectree-demo-mode');
        if (saved) {
          try {
            const parsedUser = JSON.parse(saved);
            state.user = { ...state.user, ...parsedUser };
          } catch {
            // Failed to parse - use defaults
          }
        }
      }
    },

    resetDemoSettings: (state) => {
      state.user = initialState.user;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('spectree-demo-mode');
      }
    },
  },
});

export const {
  toggleDemoMode,
  setDemoLevel,
  setActiveScenario,
  toggleFeature,
  loadDemoSettings,
  resetDemoSettings,
} = demoSlice.actions;

export default demoSlice.reducer;
