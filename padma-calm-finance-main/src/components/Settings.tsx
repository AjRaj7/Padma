// Padma Settings - App configuration and data management

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { exportAppData, clearAppData } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  Trash2, 
  User, 
  Database,
  Moon,
  Bell,
  Shield,
  HelpCircle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Settings: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [tempIncome, setTempIncome] = useState(state.user.monthlyIncome.toString());
  const [isResetting, setIsResetting] = useState(false);

  const handleIncomeUpdate = () => {
    const newIncome = parseFloat(tempIncome);
    if (newIncome > 0) {
      const oldIncome = state.user.monthlyIncome;
      const incomeIncrease = newIncome - oldIncome;
      
      dispatch({ type: 'SET_INCOME', payload: newIncome });
      
      // Update savings stream if it exists by the income increase amount
      const savingsStream = state.streams.find(s => s.name === 'Savings' && s.isGoal);
      if (savingsStream) {
        const newSavingsAmount = Math.max(0, savingsStream.originalAmount + incomeIncrease);
        dispatch({
          type: 'UPDATE_STREAM',
          payload: {
            id: savingsStream.id,
            updates: { originalAmount: newSavingsAmount }
          }
        });
      }
    }
  };

  const handleExportData = () => {
    exportAppData(state);
  };

  const handleResetApp = async () => {
    if (!confirm('⚠️ This will permanently delete ALL your data including streams, transactions, and settings. This cannot be undone. Are you absolutely sure?')) {
      return;
    }

    if (!confirm('Last chance! Type "RESET" to confirm complete data deletion.')) {
      return;
    }

    setIsResetting(true);
    
    // Clear localStorage and reset state
    clearAppData();
    dispatch({ type: 'RESET_APP' });
    
    // Brief delay for user feedback
    setTimeout(() => {
      setIsResetting(false);
      navigate('/');
    }, 1000);
  };

  const appInfo = {
    version: state.meta.version,
    totalStreams: state.streams.length,
    totalTransactions: state.transactions.length,
    lastSaved: new Date(state.meta.lastSavedDate).toLocaleDateString()
  };

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
            <h1 className="text-heading text-foreground">Settings</h1>
            <p className="text-caption text-text-secondary">
              Manage your Padma experience
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <h3 className="text-body font-medium text-foreground mb-4 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Profile
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="income" className="text-text-secondary">Monthly Income</Label>
              <div className="flex space-x-2">
                <Input
                  id="income"
                  type="number"
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  placeholder="Enter monthly income"
                  className="flex-1"
                />
                <Button 
                  onClick={handleIncomeUpdate}
                  disabled={tempIncome === state.user.monthlyIncome.toString()}
                >
                  Update
                </Button>
              </div>
            </div>
            <div className="text-sm text-text-secondary">
              Current: ₹{state.user.monthlyIncome.toLocaleString()}
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6">
          <h3 className="text-body font-medium text-foreground mb-4 flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Data Management
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-foreground">Export Data</p>
                <p className="text-caption text-text-secondary">Download all your data as backup</p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-foreground">Import Data</p>
                <p className="text-caption text-text-secondary">Restore from backup file</p>
              </div>
              <Button variant="outline" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </Card>

        {/* App Information */}
        <Card className="p-6">
          <h3 className="text-body font-medium text-foreground mb-4 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            App Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Version</span>
              <span className="text-foreground">{appInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Streams</span>
              <span className="text-foreground">{appInfo.totalStreams}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Transactions</span>
              <span className="text-foreground">{appInfo.totalTransactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Last Saved</span>
              <span className="text-foreground">{appInfo.lastSaved}</span>
            </div>
          </div>
        </Card>

        {/* About Padma */}
        <Card className="p-6">
          <h3 className="text-body font-medium text-foreground mb-4 flex items-center">
            <HelpCircle className="w-4 h-4 mr-2" />
            About Padma
          </h3>
          <div className="space-y-3 text-text-secondary">
            <p>
              Padma (पद्म) - a sacred name of Goddess Lakshmi - is your sanctuary for mindful money management.
            </p>
            <p>
              Like the lotus rising pure from muddy waters, Padma transforms financial chaos into clarity. Every interaction brings serenity to your relationship with money.
            </p>
            <p>
              "Less, but Luminous" - Where every rupee flows with intention.
            </p>
            <p className="text-caption mt-4">
              Created by Ajay Raj Singh Shekhawat<br/>
              August 2025
            </p>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/20">
          <h3 className="text-body font-medium text-destructive mb-4 flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            Danger Zone
          </h3>
          
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This action will permanently delete all your data including streams, transactions, 
              templates, and settings. This cannot be undone.
            </AlertDescription>
          </Alert>

          <Button 
            variant="destructive" 
            onClick={handleResetApp}
            disabled={isResetting}
            className="w-full"
          >
            {isResetting ? 'Resetting...' : 'Reset All Data'}
          </Button>
        </Card>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default Settings;