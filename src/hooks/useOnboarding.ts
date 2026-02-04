import { useState, useEffect } from 'react';

export type UserActivity = 'cantor' | 'banda' | 'professor' | null;

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  userActivity: UserActivity;
  hasSeenDashboardTour: boolean;
}

const ONBOARDING_STORAGE_KEY = 'playPro_onboarding';

const getInitialState = (): OnboardingState => {
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore localStorage errors
  }
  return {
    hasCompletedOnboarding: false,
    userActivity: null,
    hasSeenDashboardTour: false,
  };
};

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(getInitialState);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding on first visit
    if (!state.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [state.hasCompletedOnboarding]);

  const saveState = (newState: Partial<OnboardingState>) => {
    const updated = { ...state, ...newState };
    setState(updated);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  const completeOnboarding = (activity: UserActivity) => {
    saveState({
      hasCompletedOnboarding: true,
      userActivity: activity,
    });
    setShowOnboarding(false);
  };

  const completeDashboardTour = () => {
    saveState({ hasSeenDashboardTour: true });
  };

  const resetOnboarding = () => {
    saveState({
      hasCompletedOnboarding: false,
      userActivity: null,
      hasSeenDashboardTour: false,
    });
    setShowOnboarding(true);
  };

  const openOnboarding = () => {
    setShowOnboarding(true);
  };

  return {
    ...state,
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    completeDashboardTour,
    resetOnboarding,
    openOnboarding,
  };
};
