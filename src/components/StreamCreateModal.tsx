// Stream Create Modal - Create new financial stream

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Stream } from '@/types';
import { generateId, formatCurrency } from '@/lib/calculations';

interface StreamCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  existingStreams: Stream[];
  onCreate: (stream: Stream) => void;
}

const StreamCreateModal: React.FC<StreamCreateModalProps> = ({
  isOpen,
  onClose,
  monthlyIncome,
  existingStreams,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }

    // Check if this stream would exceed monthly income
    const totalAllocatedBudget = existingStreams
      .filter(stream => stream.name !== 'Others')
      .reduce((sum, stream) => sum + stream.originalAmount, 0);
    const newTotalBudget = totalAllocatedBudget + Number(amount);
    
    if (newTotalBudget > monthlyIncome) {
      setError(`Cannot exceed monthly income. You have ${formatCurrency(monthlyIncome - totalAllocatedBudget)} remaining to allocate.`);
      return;
    }

    const newStream: Stream = {
      id: generateId(),
      name: name.trim(),
      originalAmount: Number(amount),
      isGoal: false, // Always create spending streams
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreate(newStream);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <div className="flex items-center justify-between mb-4">
          <DialogHeader>
            <DialogTitle className="text-heading text-foreground">
              Create New Stream
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-body text-foreground">
              Stream Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-body h-12 bg-input border-border text-foreground"
              placeholder="e.g., Food, Transport, Entertainment"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-body text-foreground">
              Monthly Budget
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
                placeholder="Enter monthly budget"
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
              disabled={!name.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
              className="flex-1"
            >
              Create Stream
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StreamCreateModal; 