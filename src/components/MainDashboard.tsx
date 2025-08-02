// Padma Main Dashboard - Central mindful finance interface

import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { calculateRemainingToSpend, calculateStreamBalance, calculateStreamProgress, formatCurrency, calculateSavingsAmount, hasExceededBudget, checkBudgetExceedsIncome, generateId } from '@/lib/calculations';
import StreamCard from './StreamCard';
import TransactionModal from './TransactionModal';
import StreamEditModal from './StreamEditModal';
import StreamCreateModal from './StreamCreateModal';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Clock, Settings, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Stream } from '@/types';

const MainDashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [editingStream, setEditingStream] = useState<string | null>(null);
  const [showStreamManager, setShowStreamManager] = useState(false);
  
  // Long press functionality
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressed = useRef(false);

  const savingsAmount = calculateSavingsAmount(state.user.monthlyIncome, state.streams, state.transactions);
  const budgetExceedsIncome = checkBudgetExceedsIncome(state.user.monthlyIncome, state.streams);

  // Helper function to get Others stream tags and amounts
  const getOthersStreamData = () => {
    const othersStream = state.streams.find(s => s.name === 'Others');
    if (!othersStream) return { tags: [], totalSpent: 0 };
    
    const othersTransactions = state.transactions.filter(t => t.streamId === othersStream.id);
    const tagAmounts: { [key: string]: number } = {};
    
    othersTransactions.forEach(transaction => {
      if (transaction.tags && transaction.tags.length > 0) {
        const tag = transaction.tags[0]; // Take the first tag
        tagAmounts[tag] = (tagAmounts[tag] || 0) + transaction.amount;
      }
    });
    
    const tags = Object.entries(tagAmounts).map(([tag, amount]) => ({
      tag,
      amount
    }));
    
    const totalSpent = othersTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return { tags, totalSpent };
  };

  const handleStreamTap = (streamId: string) => {
    const stream = state.streams.find(s => s.id === streamId);
    if (!stream) return;

    // Check if this is a spending stream that has exceeded budget
    if (!stream.isGoal && stream.name !== 'Others' && hasExceededBudget(stream, state.transactions)) {
      alert(`⚠️ Budget exceeded!\n\nYou've already spent ${formatCurrency(stream.originalAmount)} on ${stream.name}.\n\nPlease edit the stream to increase the budget or wait until next month.`);
      return;
    }

    setSelectedStreamId(streamId);
    setIsTransactionModalOpen(true);
  };

  const handleStreamEdit = (streamId: string) => {
    const stream = state.streams.find(s => s.id === streamId);
    if (!stream) return;

    setEditingStream(streamId);
    setIsEditModalOpen(true);
  };

  const handleStreamUpdate = (streamId: string, updates: { name?: string; originalAmount?: number }) => {
    const stream = state.streams.find(s => s.id === streamId);
    if (!stream) return;

    // For spending streams, check if new amount is valid
    if (updates.originalAmount !== undefined && !stream.isGoal) {
      const streamTransactions = state.transactions.filter(t => t.streamId === streamId);
      const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      if (updates.originalAmount < totalSpent) {
        alert(`⚠️ Invalid budget!\n\nYou've already spent ${formatCurrency(totalSpent)} on ${stream.name}.\n\nMinimum budget must be ${formatCurrency(totalSpent)}.`);
        return;
      }
    }

    dispatch({
      type: 'UPDATE_STREAM',
      payload: {
        id: streamId,
        updates
      }
    });
  };

  const handleAddExpenseBack = (streamId: string, amount: number, note: string) => {
    const stream = state.streams.find(s => s.id === streamId);
    if (!stream) return;

    // For savings stream, add money back to main savings
    if (stream.name === 'Savings' && stream.isGoal) {
      // Create a positive transaction to add money back to savings
      const transaction: Transaction = {
        id: generateId(),
        streamId,
        amount: amount, // Positive amount to add back to savings
        note: note || 'Money added back to savings',
        tags: ['+savings'], // Tag to indicate money added
        paymentMethod: 'other',
        isRecurring: false,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    } else {
      // For other streams, create a negative transaction (expense back)
      const transaction: Transaction = {
        id: generateId(),
        streamId,
        amount: -amount, // Negative amount to add back to budget
        note: note || 'Expense added back',
        tags: [],
        paymentMethod: 'other',
        isRecurring: false,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    }
  };

  const handleStreamDelete = (streamId: string) => {
    const stream = state.streams.find(s => s.id === streamId);
    if (!stream) return;
    
    // Prevent deletion of savings stream
    if (stream.name === 'Savings') {
      alert(`⚠️ Cannot delete Savings stream!\n\nThis is a system stream that cannot be deleted.`);
      return;
    }
    
    const relatedTransactions = state.transactions.filter(t => t.streamId === streamId);
    
    if (relatedTransactions.length > 0) {
      alert(`⚠️ Cannot delete "${stream.name}"!\n\nThis stream has ${relatedTransactions.length} transaction${relatedTransactions.length > 1 ? 's' : ''}.\n\nYou can only rename it or edit the budget.`);
      return;
    }
    
    if (confirm(`Delete "${stream.name}"?`)) {
      dispatch({ type: 'DELETE_STREAM', payload: streamId });
    }
  };

  const handleStreamCreate = (newStream: Stream) => {
    dispatch({ type: 'ADD_STREAM', payload: newStream });
  };

  const handleFABClick = () => {
    if (!isLongPressed.current) {
      setSelectedStreamId(null);
      setIsTransactionModalOpen(true);
    }
  };

  const handleFABLongPress = () => {
    isLongPressed.current = true;
    setShowStreamManager(true);
  };

  const handleFABMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      handleFABLongPress();
    }, 500);
  };

  const handleFABMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleFABTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      handleFABLongPress();
    }, 500);
  };

  const handleFABTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPressed.current = false;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface safe-top safe-bottom">
      {/* Header Section */}
      <div className="px-6 pt-8 pb-6">
        {/* Main Amount Display */}
        <div className="text-center mb-6">
          <div className={`text-display mb-2 ${budgetExceedsIncome ? 'text-destructive' : 'text-foreground'}`}>
            {formatCurrency(savingsAmount)}
          </div>
          <p className="text-body font-light text-text-secondary">
            {budgetExceedsIncome ? 'Over Budget' : 'Savings'}
          </p>
          {budgetExceedsIncome && (
            <p className="text-sm text-destructive mt-2">
              Allocated budget exceeds monthly income
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={() => navigate('/history')}
          >
            <Clock className="w-4 h-4" />
            <span>History</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={() => navigate('/analytics')}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Streams Section */}
      <div className="flex-1 px-6">
        <div className="mb-6">
          <h2 className="text-heading text-foreground mb-2">Your Streams</h2>
          <p className="text-caption text-text-secondary">
            Tap to withdraw/add • Swipe left to delete • Swipe right to edit • Long press + for stream manager
          </p>
        </div>

        {state.streams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-body text-text-secondary mb-4">
              No streams yet
            </p>
            <p className="text-caption text-text-secondary mb-6">
              Create your first financial stream to get started
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mx-auto">
              Create Stream
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pb-32">
            {state.streams.map((stream) => {
              let balance, progress;
              let tags: { tag: string; amount: number }[] = [];
              
              if (stream.name === 'Savings' && stream.isGoal) {
                // For savings, show withdrawals from savings (actual spending from savings)
                balance = calculateStreamBalance(stream, state.transactions);
                progress = calculateStreamProgress(stream, state.transactions);
                
                // Get tags for savings stream
                const savingsTransactions = state.transactions.filter(t => t.streamId === stream.id);
                const tagAmounts: { [key: string]: number } = {};
                
                savingsTransactions.forEach(transaction => {
                  if (transaction.tags && transaction.tags.length > 0) {
                    const tag = transaction.tags[0];
                    // For savings, we want to show the tag as is (with + or - prefix)
                    tagAmounts[tag] = (tagAmounts[tag] || 0) + Math.abs(transaction.amount);
                  }
                });
                
                tags = Object.entries(tagAmounts).map(([tag, amount]) => ({
                  tag,
                  amount
                }));
              } else if (stream.name === 'Others') {
                // For Others, show total spent and get tags
                const { totalSpent, tags: othersTags } = getOthersStreamData();
                balance = totalSpent;
                progress = 0; // No progress for Others
                tags = othersTags;
              } else {
                balance = calculateStreamBalance(stream, state.transactions);
                progress = calculateStreamProgress(stream, state.transactions);
              }
              
              return (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  balance={balance}
                  progress={progress}
                  tags={tags}
                  onTap={() => handleStreamTap(stream.id)}
                  onEdit={() => handleStreamEdit(stream.id)}
                  onDelete={() => handleStreamDelete(stream.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-6 z-40">
        <Button
          onClick={handleFABClick}
          onMouseDown={handleFABMouseDown}
          onMouseUp={handleFABMouseUp}
          onTouchStart={handleFABTouchStart}
          onTouchEnd={handleFABTouchEnd}
          size="icon"
          className="w-16 h-16 rounded-full mindful-shadow bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {/* Stream Manager Modal */}
      {showStreamManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading text-foreground">Stream Manager</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowStreamManager(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {state.streams
                .filter(stream => stream.name !== 'Others') // Exclude Others stream from manager
                .map((stream) => {
                const streamTransactions = state.transactions.filter(t => t.streamId === stream.id);
                const hasTransactions = streamTransactions.length > 0;
                const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
                
                return (
                  <div key={stream.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-body font-medium text-foreground">{stream.name}</h3>
                      <p className="text-caption text-text-secondary">
                        {stream.isGoal ? 'Goal' : `${formatCurrency(stream.originalAmount)} budget`}
                      </p>
                      {hasTransactions && (
                        <p className="text-xs text-text-secondary">
                          {streamTransactions.length} transaction{streamTransactions.length > 1 ? 's' : ''} • {formatCurrency(totalSpent)} spent
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowStreamManager(false);
                          handleStreamEdit(stream.id);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!hasTransactions && stream.name !== 'Savings' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowStreamManager(false);
                            handleStreamDelete(stream.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <Button 
                onClick={() => {
                  setShowStreamManager(false);
                  setIsCreateModalOpen(true);
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Stream
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {isTransactionModalOpen && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          preselectedStreamId={selectedStreamId}
        />
      )}

      {/* Stream Edit Modal */}
      <StreamEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStream(null);
        }}
        stream={editingStream ? state.streams.find(s => s.id === editingStream) || null : null}
        transactions={state.transactions}
        onUpdate={handleStreamUpdate}
        onAddExpenseBack={handleAddExpenseBack}
      />

      {/* Stream Create Modal */}
      <StreamCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        monthlyIncome={state.user.monthlyIncome}
        existingStreams={state.streams}
        onCreate={handleStreamCreate}
      />
    </div>
  );
};

export default MainDashboard;