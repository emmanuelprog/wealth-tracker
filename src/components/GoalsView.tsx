import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target, 
  Plus,
  Calendar,
  TrendingUp,
  Home,
  Car,
  GraduationCap,
  Plane,
  AlertCircle,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AddGoalForm } from "@/components/forms/AddGoalForm";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/currency";

export const GoalsView = () => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  
  const { user } = useAuth();
  const { goals, loading, error, createGoal } = useGoals();
  const userCurrency = user?.user_metadata?.preferred_currency || 'NGN';
  
  const savingsGoals = goals.filter(goal => goal.goal_type === 'savings');
  const debtGoals = goals.filter(goal => goal.goal_type === 'debt_reduction');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMonthsRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const monthsRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, monthsRemaining);
  };

  const calculateMonthlyTarget = (goal: any) => {
    const remaining = Number(goal.target_amount) - Number(goal.current_amount);
    const monthsLeft = calculateMonthsRemaining(goal.target_date);
    return monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining;
  };

  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case 'emergency': return Target;
      case 'housing': return Home;
      case 'transport': return Car;
      case 'education': return GraduationCap;
      case 'vacation': return Plane;
      default: return Target;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Goals & Savings</h1>
            <p className="text-muted mt-1">Track your financial objectives and debt reduction</p>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals & Savings</h1>
          <p className="text-muted mt-1">Track your financial objectives and debt reduction</p>
        </div>
        <Button onClick={() => setShowAddGoal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Savings Goals</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(savingsGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0), userCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Saved</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(savingsGoals.reduce((sum, goal) => sum + Number(goal.current_amount), 0), userCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Debt Goals</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(debtGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0), userCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {savingsGoals.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No savings goals yet</h3>
              <p className="text-muted mb-4">Set your first savings goal to start building your future</p>
              <Button onClick={() => setShowAddGoal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {savingsGoals.map((goal) => {
                const progress = Number(goal.current_amount) / Number(goal.target_amount) * 100;
                const monthsRemaining = goal.target_date ? calculateMonthsRemaining(goal.target_date) : 0;
                const monthlyTarget = calculateMonthlyTarget(goal);
                const Icon = getGoalIcon(goal.goal_type);

                return (
                  <div key={goal.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{goal.title}</h3>
                          <p className="text-sm text-muted">
                            {formatCurrency(Number(goal.current_amount), userCurrency)} of {formatCurrency(Number(goal.target_amount), userCurrency)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        {goal.target_date && (
                          <p className="text-xs text-muted mt-1">
                            Due: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Progress value={progress} className="mb-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">{progress.toFixed(1)}% complete</span>
                      {goal.target_date && (
                        <span className="text-muted">
                          {monthsRemaining} months left • {formatCurrency(monthlyTarget, userCurrency)}/month needed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debt Reduction */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Reduction Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {debtGoals.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No debt goals set</h3>
              <p className="text-muted mb-4">Track your debt repayment progress</p>
              <Button onClick={() => setShowAddGoal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Debt Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {debtGoals.map((goal) => {
                const progress = Number(goal.current_amount) / Number(goal.target_amount) * 100;

                return (
                  <div key={goal.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.title}</h3>
                        <p className="text-sm text-muted">
                          {formatCurrency(Number(goal.current_amount), userCurrency)} paid of {formatCurrency(Number(goal.target_amount), userCurrency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        {goal.target_date && (
                          <p className="text-xs text-muted mt-1">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Progress value={progress} className="mb-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">{progress.toFixed(1)}% paid off</span>
                      <span className="text-muted">
                        {goal.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="p-0 max-w-md">
          <AddGoalForm
            onSubmit={async (goal) => {
              try {
                await createGoal({
                  title: goal.title,
                  description: goal.description,
                  target_amount: goal.targetAmount,
                  current_amount: goal.currentAmount,
                  target_date: goal.targetDate,
                  goal_type: goal.category === 'Debt Payoff' ? 'debt_reduction' : 'savings',
                  priority: 'medium',
                  is_completed: false,
                });
                setShowAddGoal(false);
              } catch (error) {
                console.error('Failed to create goal:', error);
              }
            }}
            onCancel={() => setShowAddGoal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};