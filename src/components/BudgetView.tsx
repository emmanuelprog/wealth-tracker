import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Settings,
  Plus,
  AlertCircle,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/currency";

export const BudgetView = () => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  const { user } = useAuth();
  const { budgets, loading, error, getCurrentMonthBudgets, getTotalBudgetAmount } = useBudgets();
  const { getTotalSpending } = useTransactions();
  const userCurrency = user?.user_metadata?.preferred_currency || 'NGN';
  
  const currentMonthBudgets = getCurrentMonthBudgets();
  const totalBudget = getTotalBudgetAmount();
  
  // Calculate total spending for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const totalSpent = getTotalSpending(startOfMonth, endOfMonth);
  
  const remaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getStatusColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 75) return "text-warning";
    return "text-success";
  };

  const getStatusIcon = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (percentage >= 75) return <TrendingUp className="w-4 h-4 text-warning" />;
    return <TrendingDown className="w-4 h-4 text-success" />;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budget Overview</h1>
            <p className="text-muted">Track your spending goals and progress</p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget Overview</h1>
          <p className="text-muted">Track your spending goals and progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setShowAddCategory(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-foreground">
              <Target className="w-5 h-5 mr-2" />
              Monthly Budget Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">Total Budget</span>
                <span className="font-semibold text-foreground">{formatCurrency(totalBudget, userCurrency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Spent</span>
                <span className="font-semibold text-foreground">{formatCurrency(totalSpent, userCurrency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Remaining</span>
                <span className={`font-semibold ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(Math.abs(remaining), userCurrency)}
                </span>
              </div>
              <Progress value={overallProgress} className="mt-4" />
              <p className="text-sm text-muted text-center">
                {overallProgress.toFixed(1)}% of budget used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-foreground">
              <PieChart className="w-5 h-5 mr-2" />
              Budget Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className={`text-3xl font-bold ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                {remaining >= 0 ? 'On Track' : 'Over Budget'}
              </div>
              <p className="text-sm text-muted">
                {remaining >= 0 
                  ? `You have ${formatCurrency(remaining, userCurrency)} left to spend` 
                  : `You are ${formatCurrency(Math.abs(remaining), userCurrency)} over budget`
                }
              </p>
              <Badge 
                variant={remaining >= 0 ? "default" : "destructive"}
                className="mt-2"
              >
                {remaining >= 0 ? "Good" : "Alert"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {currentMonthBudgets.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No budgets set</h3>
              <p className="text-muted mb-4">Create budget categories to track your spending</p>
              <Button onClick={() => setShowAddCategory(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Budget
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMonthBudgets.map((budget) => {
                // Calculate spending for this category in the current month
                const categorySpent = 0; // This would need to be calculated from transactions
                const percentage = Number(budget.amount) > 0 ? (categorySpent / Number(budget.amount)) * 100 : 0;
                const remaining = Number(budget.amount) - categorySpent;
                
                return (
                  <div key={budget.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{budget.category?.icon || '💰'}</span>
                        <div>
                          <h3 className="font-medium text-foreground">{budget.category?.name}</h3>
                          <p className="text-sm text-muted">
                            {formatCurrency(categorySpent, userCurrency)} of {formatCurrency(Number(budget.amount), userCurrency)}
                          </p>
                        </div>
                      </div>
                      {getStatusIcon(categorySpent, Number(budget.amount))}
                    </div>
                    
                    <Progress value={percentage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className={getStatusColor(categorySpent, Number(budget.amount))}>
                        {percentage.toFixed(1)}% used
                      </span>
                      <span className="text-muted">
                        {formatCurrency(Math.abs(remaining), userCurrency)} {remaining >= 0 ? 'left' : 'over'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add Budget Category</h2>
            <p className="text-muted">Budget category form will be implemented here.</p>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddCategory(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setShowAddCategory(false)} className="flex-1">
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};