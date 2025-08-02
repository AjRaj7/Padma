// Padma Splash Screen - Elegant app launch experience with lotus symbolism

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Allow fade transition to complete
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background to-surface transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center">
        {/* Lotus Symbol - Pulsing circle representing a lotus bud */}
        <div className="mx-auto mb-8 w-20 h-20 bg-foreground rounded-full lotus-pulse opacity-90" />
        
        {/* App Name */}
        <h1 className="text-4xl font-light tracking-widest text-foreground mb-2">
          Padma
        </h1>
        
        {/* Sanskrit Subtitle */}
        <p className="text-xl font-light text-text-secondary">
          पद्म
        </p>
        
        {/* Subtle tagline */}
        <p className="text-sm font-light text-text-secondary mt-6 opacity-60">
          Mindful Finance
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;