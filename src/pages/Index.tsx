// Padma Main Page - The lotus blooms with mindful finance

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import SplashScreen from '@/components/SplashScreen';
import OnboardingFlow from '@/components/OnboardingFlow';
import MainDashboard from '@/components/MainDashboard';

const Index = () => {
  const { state } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);
  const [hasShownSplash, setHasShownSplash] = useState(false);

  // Function to force show splash screen (for testing)
  const forceShowSplash = () => {
    setHasShownSplash(false);
    setShowSplash(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 2500);
  };

  useEffect(() => {
    // ALWAYS show splash screen on every app visit (2.5 seconds)
    console.log('App loaded - showing splash screen...');
    setShowSplash(true);
    setHasShownSplash(true);
    
    const timer = setTimeout(() => {
      console.log('Splash screen complete - showing main content');
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array - runs once on every app load

  console.log('Current state:', { showSplash, hasShownSplash });

  if (showSplash) {
    console.log('Rendering splash screen');
    return <SplashScreen />;
  }

  if (!state.user.setupComplete) {
    return (
      <div>
        <OnboardingFlow />
        {/* Debug button to test splash screen */}
        <button 
          onClick={forceShowSplash}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '8px 16px',
            background: '#00FFFF',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Show Splash
        </button>
      </div>
    );
  }

  return (
    <div>
      <MainDashboard />
      {/* Debug button to test splash screen */}
      <button 
        onClick={forceShowSplash}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '8px 16px',
          background: '#00FFFF',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Show Splash
      </button>
    </div>
  );
};

export default Index;
