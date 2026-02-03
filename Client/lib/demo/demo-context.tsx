'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { SowState, App } from '@/components/spec-tree/lib/types/work-items';
import { demoApps, getEcommerceDemoState, calculateDemoMetrics } from './demo-data';

/**
 * Demo mode state interface
 */
interface DemoState {
  isInDemoMode: boolean;
  selectedDemoApp: App | null;
  demoSowState: SowState | null;
  demoMetrics: {
    totalEpics: number;
    totalFeatures: number;
    totalUserStories: number;
    totalTasks: number;
    totalPoints: number;
    completionRate: number;
  } | null;
}

/**
 * Demo context interface
 */
interface DemoContextValue extends DemoState {
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  selectDemoApp: (appId: string) => void;
  clearDemoApp: () => void;
  availableDemoApps: App[];
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

interface DemoProviderProps {
  children: ReactNode;
}

/**
 * Demo Provider Component
 * Manages demo mode state and provides demo data to the application
 */
export function DemoProvider({ children }: DemoProviderProps) {
  const [isInDemoMode, setIsInDemoMode] = useState(false);
  const [selectedDemoApp, setSelectedDemoApp] = useState<App | null>(null);
  const [demoSowState, setDemoSowState] = useState<SowState | null>(null);

  /**
   * Enter demo mode
   */
  const enterDemoMode = useCallback(() => {
    setIsInDemoMode(true);
  }, []);

  /**
   * Exit demo mode and clear all demo state
   */
  const exitDemoMode = useCallback(() => {
    setIsInDemoMode(false);
    setSelectedDemoApp(null);
    setDemoSowState(null);
  }, []);

  /**
   * Select a demo app and load its data
   */
  const selectDemoApp = useCallback((appId: string) => {
    const app = demoApps.find(a => a.id === appId);
    if (!app) return;

    setSelectedDemoApp(app);

    // Load the appropriate demo data based on the app
    // For now, we only have e-commerce data, but this can be extended
    if (appId === 'demo-app-ecommerce') {
      setDemoSowState(getEcommerceDemoState());
    } else {
      // For other apps, we could create different demo datasets
      // For now, use the e-commerce data as a template
      const state = getEcommerceDemoState();
      state.id = appId;
      state.globalInformation = app.globalInformation;
      setDemoSowState(state);
    }
  }, []);

  /**
   * Clear the selected demo app and return to app selection
   */
  const clearDemoApp = useCallback(() => {
    setSelectedDemoApp(null);
    setDemoSowState(null);
  }, []);

  /**
   * Calculate metrics from the current demo state
   */
  const demoMetrics = useMemo(() => {
    if (!demoSowState) return null;
    return calculateDemoMetrics(demoSowState);
  }, [demoSowState]);

  const value = useMemo<DemoContextValue>(() => ({
    isInDemoMode,
    selectedDemoApp,
    demoSowState,
    demoMetrics,
    enterDemoMode,
    exitDemoMode,
    selectDemoApp,
    clearDemoApp,
    availableDemoApps: demoApps,
  }), [
    isInDemoMode,
    selectedDemoApp,
    demoSowState,
    demoMetrics,
    enterDemoMode,
    exitDemoMode,
    selectDemoApp,
    clearDemoApp,
  ]);

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

/**
 * Hook to access demo context
 */
export function useDemoContext() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
}

/**
 * Hook to check if currently in demo mode
 */
export function useIsDemo() {
  const context = useContext(DemoContext);
  return context?.isInDemoMode ?? false;
}
