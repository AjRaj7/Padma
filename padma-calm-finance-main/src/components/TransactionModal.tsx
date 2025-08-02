// Padma Transaction Modal - Mindful expense tracking interface

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { generateId, formatCurrency, calculateStreamBalance } from '@/lib/calculations';
import { Transaction, PaymentMethod, TransactionMood } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X, CreditCard, Smartphone, Banknote, MoreHorizontal } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStreamId?: string | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  preselectedStreamId,
}) => {
  const { state, dispatch } = useAppContext();
  const [amount, setAmount] = useState('');
  const [selectedStreamId, setSelectedStreamId] = useState<string>(preselectedStreamId || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [mood, setMood] = useState<TransactionMood | undefined>();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (preselectedStreamId) {
      setSelectedStreamId(preselectedStreamId);
    }
  }, [preselectedStreamId]);

  const selectedStream = state.streams.find(s => s.id === selectedStreamId);
  const streamBalance = selectedStream ? calculateStreamBalance(selectedStream, state.transactions) : 0;

  const paymentMethods: { value: PaymentMethod; icon: React.ReactNode; label: string }[] = [
    { value: 'upi', icon: <Smartphone className="w-5 h-5" />, label: 'UPI' },
    { value: 'card', icon: <CreditCard className="w-5 h-5" />, label: 'Card' },
    { value: 'cash', icon: <Banknote className="w-5 h-5" />, label: 'Cash' },
    { value: 'other', icon: <MoreHorizontal className="w-5 h-5" />, label: 'Other' },
  ];

  const moods: { value: TransactionMood; emoji: string; label: string }[] = [
    { value: 'satisfied', emoji: '😊', label: 'Satisfied' },
    { value: 'necessary', emoji: '😐', label: 'Necessary' },
    { value: 'regret', emoji: '😔', label: 'Regret' },
    { value: 'joy', emoji: '🎉', label: 'Joy' },
  ];

  const handleSave = () => {
    const amountValue = parseFloat(amount);
    
    if (!selectedStreamId || !amountValue || amountValue <= 0) {
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      streamId: selectedStreamId,
      amount: amountValue,
      note: note.trim(),
      tags: [], // TODO: Implement tag parsing from note
      paymentMethod,
      mood,
      isRecurring: false,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setPaymentMethod('upi');
    setMood(undefined);
    setSelectedStreamId('');
    setShowDetails(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-surface border-border/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-heading text-foreground">
            {selectedStream?.name === 'Savings' && selectedStream?.isGoal 
              ? 'Withdraw from Savings' 
              : preselectedStreamId ? 'Quick Add' : 'Add Expense'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Input */}
          <div className="text-center">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent border-0 border-b-2 border-text-secondary text-center text-4xl font-medium h-20 text-foreground"
              placeholder="0"
              autoFocus
            />
            <p className="text-caption text-text-secondary mt-2">
              {selectedStream?.name === 'Savings' && selectedStream?.isGoal 
                ? 'Withdrawal amount in ₹' 
                : 'Amount in ₹'}
            </p>
          </div>

          {/* Stream Selection */}
          {!preselectedStreamId && (
            <div>
              <h3 className="text-body font-medium text-foreground mb-3">Choose Stream</h3>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {state.streams.map((stream) => {
                  const balance = calculateStreamBalance(stream, state.transactions);
                  const isSelected = stream.id === selectedStreamId;
                  
                  return (
                    <Card
                      key={stream.id}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-accent/20 border-accent' 
                          : 'glass-surface hover:bg-surface/90'
                      }`}
                      onClick={() => setSelectedStreamId(stream.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-body font-medium text-foreground">
                            {stream.name}
                          </span>
                          {stream.isGoal && (
                            <span className="text-xs bg-savings/20 text-savings px-2 py-1 rounded-full">
                              Goal
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-text-secondary">
                          {formatCurrency(balance)} {stream.isGoal ? 'saved' : 'left'}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Stream Info */}
          {selectedStream && (
            <Card className="glass-surface p-3">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-foreground">
                  {selectedStream.name}
                </span>
                <span className="text-sm text-text-secondary">
                  {formatCurrency(streamBalance)} {selectedStream.isGoal ? 'saved' : 'remaining'}
                </span>
              </div>
            </Card>
          )}

          {/* Note Input */}
          <div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={selectedStream?.name === 'Savings' && selectedStream?.isGoal 
                ? "What did you withdraw for? (optional)" 
                : "What was this for? (optional)"}
              className="bg-transparent border-border text-foreground min-h-[80px]"
            />
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-body font-medium text-foreground mb-3">Payment Method</h3>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.value}
                  variant={paymentMethod === method.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod(method.value)}
                  className="flex flex-col items-center space-y-1 h-16"
                >
                  {method.icon}
                  <span className="text-xs">{method.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Mood (Optional) */}
          <div>
            <h3 className="text-body font-medium text-foreground mb-3">How do you feel? (optional)</h3>
            <div className="grid grid-cols-4 gap-2">
              {moods.map((moodOption) => (
                <Button
                  key={moodOption.value}
                  variant={mood === moodOption.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(mood === moodOption.value ? undefined : moodOption.value)}
                  className="flex flex-col items-center space-y-1 h-16"
                >
                  <span className="text-lg">{moodOption.emoji}</span>
                  <span className="text-xs">{moodOption.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!selectedStreamId || !amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              {selectedStream?.name === 'Savings' && selectedStream?.isGoal 
                ? 'Withdraw' 
                : 'Save Expense'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;