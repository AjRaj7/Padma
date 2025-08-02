// Padma Transaction Card - Elegant transaction display with swipe gestures

import React, { useState, useRef } from 'react';
import { TransactionCardProps } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, MapPin, CreditCard, Smartphone, Banknote, MoreHorizontal } from 'lucide-react';

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  stream,
  onEdit,
  onDelete,
  showStream = false,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'upi': return <Smartphone className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cash': return <Banknote className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'satisfied': return '😊';
      case 'regret': return '😔';
      case 'necessary': return '😐';
      case 'joy': return '🎉';
      default: return null;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return time.toLocaleDateString();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;
    
    // Only allow horizontal swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setIsSwipeActive(false);
      return;
    }
    
    // Constrain swipe to reasonable bounds
    const maxSwipe = 150;
    const constrainedOffset = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    setSwipeOffset(constrainedOffset);
  };

  const handleTouchEnd = () => {
    setIsSwipeActive(false);
    
    // Trigger actions based on swipe distance
    if (swipeOffset > 80) {
      onEdit();
    } else if (swipeOffset < -80) {
      onDelete();
    }
    
    // Reset position
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background action hints */}
      <div className="absolute inset-0 flex items-center justify-between px-6 bg-surface/50">
        <div className="flex items-center space-x-2 text-accent">
          <Edit3 className="w-5 h-5" />
          <span className="text-sm font-medium">Edit</span>
        </div>
        <div className="flex items-center space-x-2 text-danger">
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-medium">Delete</span>
        </div>
      </div>
      
      {/* Main card */}
      <Card 
        ref={cardRef}
        className="glass-surface p-4 transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Stream indicator and amount */}
            <div className="flex items-center space-x-3 mb-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: stream.isGoal ? 'hsl(var(--savings))' : 'hsl(var(--accent))' }}
              />
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(transaction.amount)}
              </span>
              {getMoodEmoji(transaction.mood) && (
                <span className="text-lg">{getMoodEmoji(transaction.mood)}</span>
              )}
            </div>
            
            {/* Stream name (if showing) */}
            {showStream && (
              <p className="text-sm text-text-secondary mb-1">{stream.name}</p>
            )}
            
            {/* Note */}
            {transaction.note && (
              <p className="text-sm text-foreground mb-2 line-clamp-2">
                {transaction.note}
              </p>
            )}
            
            {/* Tags */}
            {transaction.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {transaction.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-text-secondary"
                  >
                    #{tag}
                  </span>
                ))}
                {transaction.tags.length > 3 && (
                  <span className="text-xs text-text-secondary">
                    +{transaction.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            {/* Location and payment method */}
            <div className="flex items-center space-x-4 text-xs text-text-secondary">
              <div className="flex items-center space-x-1">
                {getPaymentIcon(transaction.paymentMethod)}
                <span className="capitalize">{transaction.paymentMethod}</span>
              </div>
              
              {transaction.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-24">{transaction.location.name}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className="text-xs text-text-secondary text-right ml-4">
            {formatRelativeTime(transaction.timestamp)}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TransactionCard;