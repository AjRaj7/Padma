// Padma Main Page - The lotus blooms with mindful finance

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import SplashScreen from '@/components/SplashScreen';
import OnboardingFlow from '@/components/OnboardingFlow';
import MainDashboard from '@/components/MainDashboard';

const Index = () => {
  const { state } = useAppContext();
  const [showSplash, setShowSplash] = useState(false); // Changed to false initially
  const [hasShownSplash, setHasShownSplash] = useState(false);

  useEffect(() => {
    // Only show splash on first visit or app reload
    const shouldShowSplash = !hasShownSplash && (window.performance.navigation.type === 1 || !sessionStorage.getItem('splashShown'));
    
    if (shouldShowSplash) {
      setShowSplash(true);
      setHasShownSplash(true);
      sessionStorage.setItem('splashShown', 'true');
      
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [hasShownSplash]);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!state.user.setupComplete) {
    return <OnboardingFlow />;
  }

  return <MainDashboard />;
};

export default Index;
