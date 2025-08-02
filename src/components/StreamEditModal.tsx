// Stream Edit Modal - Update stream amount

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Stream, Transaction } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface StreamEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: Stream | null;
  transactions: Transaction[];
  onUpdate: (streamId: string, newAmount: number) => void;
  onAddExpenseBack?: (streamId: string, amount: number, note: string) => void;
}

const StreamEditModal: React.FC<StreamEditModalProps> = ({
  isOpen,
  onClose,
  stream,
  transactions,
  onUpdate,
  onAddExpenseBack,
}) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showAddExpenseBack, setShowAddExpenseBack] = useState(false);
  const [expenseBackAmount, setExpenseBackAmount] = useState('');
  const [expenseBackNote, setExpenseBackNote] = useState('');

  useEffect(() => {
    if (stream && isOpen) {
      setAmount(stream.originalAmount.toString());
      setError('');
      setShowAddExpenseBack(false);
      setExpenseBackAmount('');
      setExpenseBackNote('');
    }
  }, [stream, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stream || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }

    // Check if new amount is less than total expenses for this stream
    const streamTransactions = transactions.filter(t => t.streamId === stream.id);
    const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    if (Number(amount) < totalSpent) {
      setError(`Cannot be less than ${formatCurrency(totalSpent)} (total expenses in this stream)`);
      return;
    }

    onUpdate(stream.id, Number(amount));
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    setShowAddExpenseBack(false);
    setExpenseBackAmount('');
    setExpenseBackNote('');
    onClose();
  };

  if (!stream) return null;

  const streamTransactions = transactions.filter(t => t.streamId === stream.id);
  const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
  const canAddExpenseBack = stream.name !== 'Others' && onAddExpenseBack;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <div className="flex items-center justify-between mb-4">
          <DialogHeader>
            <DialogTitle className="text-heading text-foreground">
              {showAddExpenseBack ? `Add Expense Back to ${stream.name}` : `Update ${stream.name} Limit`}
            </DialogTitle>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!showAddExpenseBack ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-body text-foreground">
                  Current: {formatCurrency(stream.originalAmount)}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError(''); // Clear error when user types
                    }}
                    className={`pl-8 text-xl h-14 bg-input border-border text-foreground ${
                      error ? 'border-destructive' : ''
                    }`}
                    placeholder="Enter new amount"
                    autoFocus
                    min="1"
                    step="1"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive mt-2">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
                  className="flex-1"
                >
                  Update
                </Button>
              </div>
            </form>

            {/* Add Expense Back Button */}
            {canAddExpenseBack && (
              <div className="pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddExpenseBack(true)}
                  className="w-full"
                >
                  Add Expense Back
                </Button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!expenseBackAmount || isNaN(Number(expenseBackAmount)) || Number(expenseBackAmount) <= 0) {
              return;
            }
            
            // Check if adding back more than allocated budget
            const streamTransactions = transactions.filter(t => t.streamId === stream.id);
            const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
            const currentBalance = stream.originalAmount - totalSpent;
            
            if (Number(expenseBackAmount) > currentBalance) {
              setError(`Cannot add back more than ${formatCurrency(currentBalance)} (current remaining budget)`);
              return;
            }
            
            onAddExpenseBack?.(stream.id, Number(expenseBackAmount), expenseBackNote.trim());
            handleClose();
          }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expenseBackAmount" className="text-body text-foreground">
                Amount to Add Back
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                  ₹
                </span>
                <Input
                  id="expenseBackAmount"
                  type="number"
                  value={expenseBackAmount}
                  onChange={(e) => {
                    setExpenseBackAmount(e.target.value);
                    setError(''); // Clear error when user types
                  }}
                  className={`pl-8 text-xl h-14 bg-input border-border text-foreground ${
                    error ? 'border-destructive' : ''
                  }`}
                  placeholder="Enter amount"
                  autoFocus
                  min="1"
                  step="1"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive mt-2">
                  {error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseBackNote" className="text-body text-foreground">
                Note (Optional)
              </Label>
              <Input
                id="expenseBackNote"
                value={expenseBackNote}
                onChange={(e) => setExpenseBackNote(e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="e.g., Refund, Return, etc."
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddExpenseBack(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!expenseBackAmount || isNaN(Number(expenseBackAmount)) || Number(expenseBackAmount) <= 0}
                className="flex-1"
              >
                Add Back
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StreamEditModal;