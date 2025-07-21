import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Plus,
  Calendar,
  TrendingUp,
  Home,
  Car,
  GraduationCap,
  Plane
} from "lucide-react";

export const GoalsView = () => {
  const savingsGoals = [
    {
      id: 1,
      name: "Emergency Fund",
      target: 500000,
      current: 185000,
      deadline: "2024-12-31",
      category: "emergency",
      icon: Target,
      priority: "high"
    },
    {
      id: 2,
      name: "House Down Payment",
      target: 2000000,
      current: 450000,
      deadline: "2025-06-30",
      category: "housing",
      icon: Home,
      priority: "high"
    },
    {
      id: 3,
      name: "Car Purchase",
      target: 1500000,
      current: 320000,
      deadline: "2024-08-15",
      category: "transport",
      icon: Car,
      priority: "medium"
    },
    {
      id: 4,
      name: "Masters Degree",
      target: 800000,
      current: 120000,
      deadline: "2025-09-01",
      category: "education",
      icon: GraduationCap,
      priority: "medium"
    },
    {
      id: 5,
      name: "Vacation Fund",
      target: 300000,
      current: 95000,
      deadline: "2024-07-01",
      category: "lifestyle",
      icon: Plane,
      priority: "low"
    }
  ];

  const debtGoals = [
    {
      id: 1,
      name: "Credit Card Debt",
      total: 150000,
      remaining: 85000,
      monthlyPayment: 25000,
      interestRate: 18.5,
      payoffDate: "2024-04-30"
    },
    {
      id: 2,
      name: "Student Loan",
      total: 800000,
      remaining: 620000,
      monthlyPayment: 45000,
      interestRate: 12.0,
      payoffDate: "2025-08-15"
    }
  ];

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
    const remaining = goal.target - goal.current;
    const monthsLeft = calculateMonthsRemaining(goal.deadline);
    return monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining;
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals & Savings</h1>
          <p className="text-muted mt-1">Track your financial objectives and debt reduction</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

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
                  ₦{savingsGoals.reduce((sum, goal) => sum + goal.target, 0).toLocaleString()}
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
                  ₦{savingsGoals.reduce((sum, goal) => sum + goal.current, 0).toLocaleString()}
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
                <p className="text-sm text-muted">Remaining Debt</p>
                <p className="text-xl font-bold text-foreground">
                  ₦{debtGoals.reduce((sum, debt) => sum + debt.remaining, 0).toLocaleString()}
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
          <div className="space-y-4">
            {savingsGoals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              const monthsRemaining = calculateMonthsRemaining(goal.deadline);
              const monthlyTarget = calculateMonthlyTarget(goal);
              const Icon = goal.icon;

              return (
                <div key={goal.id} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.name}</h3>
                        <p className="text-sm text-muted">
                          ₦{goal.current.toLocaleString()} of ₦{goal.target.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <p className="text-xs text-muted mt-1">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="mb-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">{progress.toFixed(1)}% complete</span>
                    <span className="text-muted">
                      {monthsRemaining} months left • ₦{monthlyTarget.toLocaleString()}/month needed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Debt Reduction */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Reduction Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debtGoals.map((debt) => {
              const progress = ((debt.total - debt.remaining) / debt.total) * 100;

              return (
                <div key={debt.id} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{debt.name}</h3>
                      <p className="text-sm text-muted">
                        ₦{debt.remaining.toLocaleString()} remaining of ₦{debt.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {debt.interestRate}% APR
                      </p>
                      <p className="text-xs text-muted">
                        Payoff: {new Date(debt.payoffDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="mb-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">{progress.toFixed(1)}% paid off</span>
                    <span className="text-muted">
                      ₦{debt.monthlyPayment.toLocaleString()}/month payment
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};