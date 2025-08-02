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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #141414 100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {/* Lotus Symbol - Pulsing circle representing a lotus bud */}
        <div 
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#EAEAEA',
            borderRadius: '50%',
            margin: '0 auto 32px auto',
            opacity: 0.9,
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        
        {/* App Name */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 300,
          letterSpacing: '0.1em',
          color: '#EAEAEA',
          marginBottom: '8px',
          margin: 0
        }}>
          Padma
        </h1>
        
        {/* Sanskrit Subtitle */}
        <p style={{
          fontSize: '1.25rem',
          fontWeight: 300,
          color: '#888888',
          margin: 0
        }}>
          पद्म
        </p>
        
        {/* Subtle tagline */}
        <p style={{
          fontSize: '0.875rem',
          fontWeight: 300,
          color: '#888888',
          marginTop: '24px',
          opacity: 0.6,
          margin: 0
        }}>
          Mindful Finance
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;