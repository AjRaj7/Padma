// Padma Onboarding Flow - Gentle introduction to mindful finance

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { generateId, formatCurrency } from '@/lib/calculations';
import { Stream } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';

const OnboardingFlow: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [tempStreams, setTempStreams] = useState<Stream[]>([]);
  const [streamName, setStreamName] = useState('');
  const [streamAmount, setStreamAmount] = useState('');

  const totalAllocated = tempStreams.reduce((sum, stream) => sum + stream.originalAmount, 0);
  const remainingAmount = parseInt(monthlyIncome) - totalAllocated;

  const handleIncomeNext = () => {
    const income = parseInt(monthlyIncome);
    if (income > 0) {
      dispatch({ type: 'SET_INCOME', payload: income });
      setCurrentStep(2);
    }
  };

  const handleAddStream = () => {
    const amount = parseInt(streamAmount);
    if (streamName.trim() && amount > 0) {
      // Check if this stream would exceed monthly income
      const totalAllocated = tempStreams.reduce((sum, stream) => sum + stream.originalAmount, 0);
      const newTotalBudget = totalAllocated + amount;
      
      if (newTotalBudget > parseInt(monthlyIncome)) {
        alert(`⚠️ Cannot exceed monthly income!\n\nYou have ${formatCurrency(parseInt(monthlyIncome) - totalAllocated)} remaining to allocate.`);
        return;
      }
      
      const newStream: Stream = {
        id: generateId(),
        name: streamName.trim(),
        originalAmount: amount,
        isGoal: false, // Always create spending streams
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setTempStreams([...tempStreams, newStream]);
      setStreamName('');
      setStreamAmount('');
    }
  };

  const handleDeleteStream = (id: string) => {
    setTempStreams(tempStreams.filter(stream => stream.id !== id));
  };

  const handleFinishSetup = () => {
    // Add all streams to the app state
    tempStreams.forEach(stream => {
      dispatch({ type: 'ADD_STREAM', payload: stream });
    });
    
    // Create a "Savings" stream with 0 amount (will be calculated dynamically)
    const savingsStream: Stream = {
      id: generateId(),
      name: 'Savings',
      originalAmount: 0, // Will be calculated dynamically
      isGoal: true, // This is a savings goal
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_STREAM', payload: savingsStream });
    
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-heading text-foreground mb-8">
            Set your monthly flow
          </h1>
          
          <div className="mb-8">
            <Input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="bg-transparent border-0 border-b-2 border-text-secondary text-center text-5xl font-bold h-24 text-foreground"
              placeholder="0"
              autoFocus
            />
            <p className="text-caption text-text-secondary mt-4">
              Your total monthly income in ₹
            </p>
          </div>
          
          <Button 
            onClick={handleIncomeNext}
            disabled={!monthlyIncome || parseInt(monthlyIncome) <= 0}
            size="lg"
            className="w-full"
          >
            Next <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(1)}
            className="absolute left-6 top-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <h1 className="text-heading text-foreground mb-2">
            Carve your streams
          </h1>
          <p className="text-body text-text-secondary mb-4">
            Allocate your {formatCurrency(parseInt(monthlyIncome))} into spending streams
          </p>
          
          <div className="text-xl text-accent font-semibold">
            Auto-Savings: {formatCurrency(remainingAmount)}
          </div>
        </div>

        {/* Stream Creation Form */}
        <Card className="glass-surface p-6 mb-6">
          <div className="space-y-4">
            <Input
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
              placeholder="Stream name (e.g., Food)"
              className="bg-transparent border-border"
            />
            
            <Input
              type="number"
              value={streamAmount}
              onChange={(e) => setStreamAmount(e.target.value)}
              placeholder="₹ Amount"
              className="bg-transparent border-border"
            />
            

            
            <Button 
              onClick={handleAddStream}
              disabled={!streamName.trim() || !streamAmount || parseInt(streamAmount) <= 0}
              className="w-full"
            >
              Add Stream
            </Button>
          </div>
        </Card>

        {/* Stream List */}
        {tempStreams.length > 0 && (
          <div className="space-y-3 mb-8">
            {tempStreams.map((stream) => (
              <Card key={stream.id} className="glass-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-body font-medium text-foreground">
                        {stream.name}
                      </span>
                      {stream.isGoal && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-savings/20 text-savings font-medium">
                          Goal
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-body font-semibold text-foreground">
                      {formatCurrency(stream.originalAmount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStream(stream.id)}
                      className="h-8 w-8 text-danger hover:bg-danger/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Completion */}
        {tempStreams.length > 0 && (
          <Button 
            onClick={handleFinishSetup}
            size="lg"
            className="w-full"
          >
            Finish Setup
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;