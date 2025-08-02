// Padma Main Dashboard - Central mindful finance interface

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { calculateRemainingToSpend, calculateStreamBalance, calculateStreamProgress, formatCurrency, calculateSavingsAmount } from '@/lib/calculations';
import StreamCard from './StreamCard';
import TransactionModal from './TransactionModal';
import StreamEditModal from './StreamEditModal';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Clock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MainDashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [editingStream, setEditingStream] = useState<string | null>(null);

  const savingsAmount = calculateSavingsAmount(state.user.monthlyIncome, state.streams);

  const handleStreamTap = (streamId: string) => {
    setSelectedStreamId(streamId);
    setIsTransactionModalOpen(true);
  };

  const handleStreamEdit = (streamId: string) => {
    setEditingStream(streamId);
    setIsEditModalOpen(true);
  };

  const handleStreamUpdate = (streamId: string, newAmount: number) => {
    dispatch({
      type: 'UPDATE_STREAM',
      payload: {
        id: streamId,
        updates: { originalAmount: newAmount }
      }
    });
  };

  const handleStreamDelete = (streamId: string) => {
    const stream = state.streams.find(s => s.id === streamId);
    if (!stream) return;
    
    const relatedTransactions = state.transactions.filter(t => t.streamId === streamId);
    const confirmMessage = relatedTransactions.length > 0 
      ? `Delete "${stream.name}"?\n\nThis will also delete ${relatedTransactions.length} transaction${relatedTransactions.length > 1 ? 's' : ''}.`
      : `Delete "${stream.name}"?`;
    
    if (confirm(confirmMessage)) {
      dispatch({ type: 'DELETE_STREAM', payload: streamId });
    }
  };

  const handleFABClick = () => {
    setSelectedStreamId(null);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface safe-top safe-bottom">
      {/* Header Section */}
      <div className="px-6 pt-8 pb-6">
        {/* Main Amount Display */}
        <div className="text-center mb-6">
          <div className="text-display text-foreground mb-2">
            {formatCurrency(savingsAmount)}
          </div>
          <p className="text-body font-light text-text-secondary">
            Savings
          </p>
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
            Tap to add expense • Swipe left to delete • Swipe right to edit
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
            <Button onClick={handleFABClick} className="mx-auto">
              Create Stream
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pb-32">
            {state.streams.map((stream) => {
              let balance, progress;
              
              if (stream.name === 'Savings' && stream.isGoal) {
                // For savings, show the calculated savings amount
                balance = savingsAmount;
                progress = 0; // No progress for dynamic savings
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
          size="icon"
          className="w-16 h-16 rounded-full mindful-shadow bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

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
        onUpdate={handleStreamUpdate}
      />
    </div>
  );
};

export default MainDashboard;