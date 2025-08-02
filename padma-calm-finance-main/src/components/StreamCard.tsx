// Padma Stream Card - Beautiful display for financial streams with mindful interactions

import React, { useRef, useState } from 'react';
import { StreamCardProps } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  balance,
  progress,
  onTap,
  onEdit,
  onDelete,
}) => {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    // Limit swipe distance and add resistance
    const maxSwipe = 120;
    const resistance = 0.7;
    const constrainedDelta = Math.sign(deltaX) * Math.min(Math.abs(deltaX) * resistance, maxSwipe);
    
    setSwipeX(constrainedDelta);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX.current - startX.current;
    const threshold = 80;
    
    if (Math.abs(deltaX) > threshold) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      if (deltaX > 0) {
        // Right swipe - edit
        onEdit();
      } else {
        // Left swipe - delete
        onDelete();
      }
    } else if (Math.abs(deltaX) < 10) {
      // Small movement, treat as tap
      onTap();
    }
    
    // Reset
    setSwipeX(0);
    setIsDragging(false);
    startX.current = 0;
    currentX.current = 0;
  };

  const handleClick = () => {
    if (!isDragging && swipeX === 0) {
      onTap();
    }
  };

  return (
    <Card 
      className="glass-surface p-6 touch-feedback cursor-pointer transition-all duration-300 hover:bg-surface/90 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      style={{
        transform: `translateX(${swipeX}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {stream.icon && (
            <span className="text-2xl">{stream.icon}</span>
          )}
          <div>
            <h3 className="text-body font-medium text-foreground">
              {stream.name}
            </h3>
            {stream.isGoal && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-savings/20 text-savings font-medium">
                Goal
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-body font-semibold text-foreground">
            {formatCurrency(balance)}
          </p>
          <p className="text-caption text-text-secondary">
            {stream.isGoal ? 'saved' : 'remaining'}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-caption text-text-secondary">
          <span>
            {stream.isGoal ? 'Progress' : 'Used'}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2"
          style={{
            '--progress-color': stream.isGoal ? 'hsl(var(--savings))' : 'hsl(var(--accent))'
          } as React.CSSProperties}
        />
      </div>
      
      {/* Budget Reference */}
      {!stream.isGoal && (
        <div className="mt-3 text-caption text-text-secondary">
          {formatCurrency(stream.originalAmount)} budget
        </div>
      )}
      
      {/* Swipe Action Indicators */}
      {Math.abs(swipeX) > 20 && (
        <div 
          className={`absolute inset-y-0 flex items-center px-6 text-white font-medium ${
            swipeX > 0 
              ? 'left-0 bg-accent/20 text-accent' 
              : 'right-0 bg-danger/20 text-danger'
          }`}
        >
          {swipeX > 0 ? '✏️ Edit' : '🗑️ Delete'}
        </div>
      )}
    </Card>
  );
};

export default StreamCard;