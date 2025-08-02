// Padma Analytics Dashboard - Mindful insights and spending patterns

import React, { useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { 
  calculateRemainingToSpend, 
  calculateSavingsRate, 
  calculateTotalSpent,
  calculateStreamHealth,
  getSpendingVelocity,
  formatCurrency 
} from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Heart, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalyticsDashboard: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const analytics = useMemo(() => {
    const totalSpent = calculateTotalSpent(state.streams, state.transactions);
    const remainingToSpend = calculateRemainingToSpend(state.streams, state.transactions);
    const savingsRate = calculateSavingsRate(state);
    const velocity = getSpendingVelocity(state.transactions);

    // Stream health scores
    const streamHealth = state.streams.map(stream => ({
      stream,
      health: calculateStreamHealth(stream, state.transactions),
      spent: state.transactions
        .filter(t => t.streamId === stream.id)
        .reduce((sum, t) => sum + t.amount, 0)
    })).sort((a, b) => b.health - a.health);

    // Monthly progress
    const monthProgress = (() => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysPassed = now.getDate();
      return (daysPassed / daysInMonth) * 100;
    })();

    // Spending insights
    const insights = [];
    
    if (velocity.weeklyTrend === 'increasing') {
      insights.push({
        type: 'caution' as const,
        message: 'Your spending has increased this week',
        icon: TrendingUp
      });
    } else if (velocity.weeklyTrend === 'decreasing') {
      insights.push({
        type: 'positive' as const,
        message: 'Great! Your spending is trending down',
        icon: TrendingDown
      });
    }

    if (savingsRate > 20) {
      insights.push({
        type: 'positive' as const,
        message: `Excellent savings rate of ${savingsRate.toFixed(1)}%`,
        icon: Target
      });
    }

    const mindfulTransactions = state.transactions.filter(t => t.note.trim().length > 0).length;
    const mindfulnessRate = state.transactions.length > 0 ? (mindfulTransactions / state.transactions.length) * 100 : 0;
    
    if (mindfulnessRate > 70) {
      insights.push({
        type: 'positive' as const,
        message: `${mindfulnessRate.toFixed(0)}% of your transactions have notes - very mindful!`,
        icon: Heart
      });
    }

    return {
      totalSpent,
      remainingToSpend,
      savingsRate,
      velocity,
      streamHealth,
      monthProgress,
      insights,
      mindfulnessRate
    };
  }, [state]);

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-success';
    if (health >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getHealthBadge = (health: number) => {
    if (health >= 80) return { text: 'Excellent', variant: 'default' as const };
    if (health >= 60) return { text: 'Good', variant: 'secondary' as const };
    return { text: 'Needs Attention', variant: 'destructive' as const };
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
            <h1 className="text-heading text-foreground">Analytics</h1>
            <p className="text-caption text-text-secondary">
              Your mindful spending insights
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(analytics.totalSpent)}
              </div>
              <p className="text-caption text-text-secondary">Total Spent</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {analytics.savingsRate.toFixed(1)}%
              </div>
              <p className="text-caption text-text-secondary">Savings Rate</p>
            </div>
          </Card>
        </div>

        {/* Monthly Progress */}
        <Card className="p-6">
          <h3 className="text-body font-medium text-foreground mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Monthly Progress
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Days passed</span>
              <span className="text-foreground">{analytics.monthProgress.toFixed(0)}%</span>
            </div>
            <Progress value={analytics.monthProgress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Budget used</span>
              <span className="text-foreground">
                {state.user.monthlyIncome > 0 
                  ? ((analytics.totalSpent / state.user.monthlyIncome) * 100).toFixed(0)
                  : 0
                }%
              </span>
            </div>
          </div>
        </Card>

        {/* Spending Velocity */}
        <Card className="p-6">
          <h3 className="text-body font-medium text-foreground mb-4 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Spending Velocity
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {formatCurrency(analytics.velocity.dailyAverage)}
                </div>
                <p className="text-xs text-text-secondary">Daily Avg</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {formatCurrency(analytics.velocity.dailyAverage * 7)}
                </div>
                <p className="text-xs text-text-secondary">Weekly Avg</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {formatCurrency(analytics.velocity.forecast)}
                </div>
                <p className="text-xs text-text-secondary">Monthly Est</p>
              </div>
            </div>
            
            {/* Simple Chart Visualization */}
            <div className="h-32 flex items-end justify-between space-x-1 bg-surface/30 rounded-lg p-4">
              {(() => {
                const now = new Date();
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                  const date = new Date(now);
                  date.setDate(date.getDate() - i);
                  const dayTransactions = state.transactions.filter(t => {
                    const tDate = new Date(t.timestamp);
                    return tDate.toDateString() === date.toDateString();
                  });
                  const amount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
                  last7Days.push({
                    day: date.toLocaleDateString('en', { weekday: 'short' }),
                    amount
                  });
                }
                const maxAmount = Math.max(...last7Days.map(d => d.amount), 1);
                
                return last7Days.map((day, index) => {
                  const height = (day.amount / maxAmount) * 80;
                  return (
                    <div key={index} className="flex flex-col items-center space-y-1">
                      <div 
                        className="w-4 bg-accent rounded-t-sm transition-all duration-300"
                        style={{ height: `${Math.max(height, 2)}px` }}
                      />
                      <span className="text-xs text-text-secondary">
                        {day.day}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Weekly Trend</span>
              <Badge 
                variant={
                  analytics.velocity.weeklyTrend === 'increasing' ? 'destructive' :
                  analytics.velocity.weeklyTrend === 'decreasing' ? 'default' : 'secondary'
                }
              >
                {analytics.velocity.weeklyTrend}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Stream Health */}
        <Card className="p-6">
          <h3 className="text-body font-medium text-foreground mb-4 flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Stream Health
          </h3>
          <div className="space-y-4">
            {analytics.streamHealth.map(({ stream, health, spent }) => {
              const badge = getHealthBadge(health);
              return (
                <div key={stream.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-foreground font-medium">{stream.name}</span>
                      {stream.isGoal && <Badge variant="outline" className="ml-2 text-xs">Goal</Badge>}
                    </div>
                    <Badge variant={badge.variant}>{badge.text}</Badge>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Health Score: {health}/100</span>
                    <span>Spent: {formatCurrency(spent)}</span>
                  </div>
                  <Progress value={health} className="h-1" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Insights */}
        {analytics.insights.length > 0 && (
          <Card className="p-6">
            <h3 className="text-body font-medium text-foreground mb-4">
              Insights
            </h3>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <insight.icon className={`w-5 h-5 mt-0.5 ${
                    insight.type === 'positive' ? 'text-success' : 'text-warning'
                  }`} />
                  <p className="text-text-secondary">{insight.message}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Mindfulness Score */}
        <Card className="p-6">
          <h3 className="text-body font-medium text-foreground mb-4 flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Mindfulness Score
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {analytics.mindfulnessRate.toFixed(0)}%
            </div>
            <p className="text-caption text-text-secondary mb-4">
              of your transactions include thoughtful notes
            </p>
            <Progress value={analytics.mindfulnessRate} className="h-3" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;