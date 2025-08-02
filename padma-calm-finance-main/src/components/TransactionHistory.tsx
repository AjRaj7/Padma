// Padma Transaction History - Complete transaction management interface

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Transaction, Stream } from '@/types';
import TransactionCard from './TransactionCard';

const TransactionHistory: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    let filtered = state.transactions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        state.streams.find(s => s.id === t.streamId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by stream
    if (selectedStream !== 'all') {
      filtered = filtered.filter(t => t.streamId === selectedStream);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Group by date
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
        groupKey = date.toLocaleDateString('en-US', { weekday: 'long' });
      } else {
        groupKey = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });

    return groups;
  }, [state.transactions, state.streams, searchQuery, selectedStream]);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm('Delete this transaction?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
    }
  };

  const totalTransactions = state.transactions.length;
  const filteredCount = Object.values(groupedTransactions).flat().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center px-6 py-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-heading text-foreground">Transaction History</h1>
            <p className="text-caption text-text-secondary">
              {filteredCount} of {totalTransactions} transactions
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-6 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stream Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant={selectedStream === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStream('all')}
              className="whitespace-nowrap"
            >
              All Streams
            </Button>
            {state.streams.map(stream => (
              <Button
                key={stream.id}
                variant={selectedStream === stream.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedStream(stream.id)}
                className="whitespace-nowrap"
              >
                {stream.name}
                {stream.isGoal && <Badge variant="secondary" className="ml-1 text-xs">Goal</Badge>}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Groups */}
      <div className="px-6 py-4 space-y-6">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-body text-text-secondary mb-2">
              {searchQuery || selectedStream !== 'all' ? 'No matching transactions' : 'No transactions yet'}
            </p>
            <p className="text-caption text-text-secondary">
              {searchQuery || selectedStream !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start tracking your expenses to see them here'
              }
            </p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([groupKey, transactions]) => (
            <div key={groupKey} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-medium text-foreground">{groupKey}</h3>
                <p className="text-caption text-text-secondary">
                  {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </div>
              
              <div className="space-y-2">
                {transactions.map(transaction => {
                  const stream = state.streams.find(s => s.id === transaction.streamId);
                  return (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      stream={stream!}
                      onEdit={() => handleEditTransaction(transaction)}
                      onDelete={() => handleDeleteTransaction(transaction.id)}
                      showStream={selectedStream === 'all'}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;