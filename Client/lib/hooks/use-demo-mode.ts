import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  toggleDemoMode,
  setDemoLevel,
  setActiveScenario,
  toggleFeature,
  loadDemoSettings,
  resetDemoSettings,
  DemoFeature,
  DemoLevel,
  DemoScenario,
  DEMO_SCENARIOS,
} from '../store/demo-slice';

export const useDemoMode = () => {
  const dispatch = useDispatch<AppDispatch>();
  const demoState = useSelector((state: RootState) => state.demo);

  // Load saved settings on mount
  useEffect(() => {
    dispatch(loadDemoSettings());
  }, [dispatch]);

  const isDemoMode = demoState?.user?.isDemoMode ?? false;
  const demoLevel = demoState?.user?.demoLevel ?? 'basic';
  const enabledFeatures = demoState?.user?.enabledFeatures ?? [];
  const activeScenario = demoState?.user?.activeScenario ?? null;

  // Check if a specific feature is enabled
  const hasFeature = (feature: DemoFeature): boolean => {
    return isDemoMode && enabledFeatures.includes(feature);
  };

  // Check if demo level meets requirement
  const hasLevel = (requiredLevel: DemoLevel): boolean => {
    if (!isDemoMode) return false;

    const levels: DemoLevel[] = ['basic', 'advanced', 'developer'];
    const currentLevelIndex = levels.indexOf(demoLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);

    return currentLevelIndex >= requiredLevelIndex;
  };

  // Get scenario info
  const getScenarioInfo = (scenario: DemoScenario) => {
    return DEMO_SCENARIOS[scenario];
  };

  // Get all available scenarios
  const getAvailableScenarios = () => {
    return Object.entries(DEMO_SCENARIOS).map(([key, value]) => ({
      id: key as DemoScenario,
      ...value,
    }));
  };

  return {
    // State
    isDemoMode,
    demoLevel,
    enabledFeatures,
    activeScenario,
    config: demoState?.config,

    // Feature checks
    hasFeature,
    hasLevel,

    // Scenario helpers
    getScenarioInfo,
    getAvailableScenarios,
    activeScenarioInfo: activeScenario
      ? DEMO_SCENARIOS[activeScenario]
      : null,

    // Actions
    toggleDemo: () => dispatch(toggleDemoMode()),
    setLevel: (level: DemoLevel) => dispatch(setDemoLevel(level)),
    setScenario: (scenario: DemoScenario | null) =>
      dispatch(setActiveScenario(scenario)),
    toggleDemoFeature: (feature: DemoFeature, enabled: boolean) =>
      dispatch(toggleFeature({ feature, enabled })),
    resetSettings: () => dispatch(resetDemoSettings()),
  };
};

export default useDemoMode;
