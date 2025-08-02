// Stream Edit Modal - Update stream amount

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Stream } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface StreamEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: Stream | null;
  onUpdate: (streamId: string, newAmount: number) => void;
}

const StreamEditModal: React.FC<StreamEditModalProps> = ({
  isOpen,
  onClose,
  stream,
  onUpdate,
}) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (stream && isOpen) {
      setAmount(stream.originalAmount.toString());
    }
  }, [stream, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stream || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }

    onUpdate(stream.id, Number(amount));
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  if (!stream) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <div className="flex items-center justify-between mb-4">
          <DialogHeader>
            <DialogTitle className="text-heading text-foreground">
              Update {stream.name} Limit
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
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-xl h-14 bg-input border-border text-foreground"
                placeholder="Enter new amount"
                autoFocus
                min="1"
                step="1"
              />
            </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default StreamEditModal;