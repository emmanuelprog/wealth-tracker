import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Settings,
  Plus
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const BudgetView = () => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  // Mock budget data
  const monthlyBudget = 3000;
  const totalSpent = 1850;
  const remaining = monthlyBudget - totalSpent;
  const overallProgress = (totalSpent / monthlyBudget) * 100;
  
  const budgetCategories = [
    { 
      name: "Groceries", 
      budgeted: 600, 
      spent: 420, 
      color: "bg-blue-500",
      icon: "🛒"
    },
    { 
      name: "Transportation", 
      budgeted: 300, 
      spent: 245, 
      color: "bg-purple-500",
      icon: "🚗"
    },
    { 
      name: "Entertainment", 
      budgeted: 200, 
      spent: 185, 
      color: "bg-pink-500",
      icon: "🎬"
    },
    { 
      name: "Food & Dining", 
      budgeted: 400, 
      spent: 320, 
      color: "bg-orange-500",
      icon: "🍽️"
    },
    { 
      name: "Shopping", 
      budgeted: 300, 
      spent: 150, 
      color: "bg-indigo-500",
      icon: "🛍️"
    },
    { 
      name: "Utilities", 
      budgeted: 250, 
      spent: 230, 
      color: "bg-gray-500",
      icon: "⚡"
    },
    { 
      name: "Healthcare", 
      budgeted: 200, 
      spent: 80, 
      color: "bg-green-500",
      icon: "🏥"
    },
    { 
      name: "Miscellaneous", 
      budgeted: 250, 
      spent: 220, 
      color: "bg-yellow-500",
      icon: "📦"
    },
  ];

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
                <span className="font-semibold text-foreground">₦{monthlyBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Spent</span>
                <span className="font-semibold text-foreground">₦{totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Remaining</span>
                <span className={`font-semibold ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₦{Math.abs(remaining).toLocaleString()}
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
                  ? `You have ₦${remaining.toLocaleString()} left to spend` 
                  : `You are ₦${Math.abs(remaining).toLocaleString()} over budget`
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetCategories.map((category) => {
              const percentage = (category.spent / category.budgeted) * 100;
              const remaining = category.budgeted - category.spent;
              
              return (
                <div key={category.name} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-medium text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted">
                          ₦{category.spent} of ₦{category.budgeted}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(category.spent, category.budgeted)}
                  </div>
                  
                  <Progress value={percentage} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className={getStatusColor(category.spent, category.budgeted)}>
                      {percentage.toFixed(1)}% used
                    </span>
                    <span className="text-muted">
                      ₦{Math.abs(remaining)} {remaining >= 0 ? 'left' : 'over'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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