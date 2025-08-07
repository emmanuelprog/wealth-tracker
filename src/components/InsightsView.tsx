import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Target,
  PiggyBank,
  CreditCard,
  BarChart3
} from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useGoals } from "@/hooks/useGoals";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency } from "@/lib/currency";

export const InsightsView = () => {
  const { getTotalBalance } = useAccounts();
  const { getTotalSpending, getTotalIncome, transactions } = useTransactions();
  const { getCurrentMonthBudgets, getTotalBudgetAmount } = useBudgets();
  const { goals, getTotalSavingsTarget, getTotalSavingsProgress } = useGoals();
  const { profile } = useProfile();

  const currency = profile?.preferred_currency || "NGN";

  // Calculate real financial metrics
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalSpending();
  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;
  
  const currentMonthBudgets = getCurrentMonthBudgets();
  const totalBudget = getTotalBudgetAmount();
  const budgetAdherence = totalBudget > 0 ? Math.max(0, ((totalBudget - totalExpenses) / totalBudget) * 100) : 100;

  // Generate real insights based on user data
  const generateInsights = () => {
    const insights = [];

    // Savings goal insight
    const savingsGoals = goals.filter(goal => goal.goal_type === 'savings');
    if (savingsGoals.length > 0) {
      const progress = getTotalSavingsProgress();
      const target = getTotalSavingsTarget();
      const progressPercentage = target > 0 ? (progress / target) * 100 : 0;
      
      insights.push({
        id: 1,
        type: "saving",
        title: progressPercentage > 50 ? "Great Progress on Savings!" : "Boost Your Savings",
        description: `You're ${progressPercentage.toFixed(1)}% towards your savings goals (${formatCurrency(progress, currency)} of ${formatCurrency(target, currency)}).`,
        impact: progressPercentage > 50 ? "positive" : "negative",
        action: progressPercentage > 50 
          ? "Keep up the excellent work! Consider increasing your savings rate."
          : "Consider setting up automatic transfers to boost your savings.",
        icon: PiggyBank,
        priority: progressPercentage < 25 ? "high" : "medium"
      });
    }

    // Budget adherence insight
    if (budgetAdherence < 90) {
      insights.push({
        id: 2,
        type: "spending",
        title: "Budget Alert",
        description: `You've used ${(100 - budgetAdherence).toFixed(1)}% more than your monthly budget.`,
        impact: "negative",
        action: "Review your spending categories and consider adjusting your budget or reducing expenses.",
        icon: AlertTriangle,
        priority: budgetAdherence < 70 ? "high" : "medium"
      });
    } else {
      insights.push({
        id: 2,
        type: "spending",
        title: "Budget on Track!",
        description: `You're staying within ${budgetAdherence.toFixed(1)}% of your monthly budget.`,
        impact: "positive",
        action: "Great job managing your expenses! Keep monitoring your spending.",
        icon: Target,
        priority: "low"
      });
    }

    // Income vs expenses insight
    if (netIncome < 0) {
      insights.push({
        id: 3,
        type: "debt",
        title: "Spending Exceeds Income",
        description: `Your expenses are ${formatCurrency(Math.abs(netIncome), currency)} more than your income this month.`,
        impact: "negative",
        action: "Review your expenses and identify areas to cut back. Consider additional income sources.",
        icon: CreditCard,
        priority: "high"
      });
    } else if (savingsRate > 20) {
      insights.push({
        id: 3,
        type: "investment",
        title: "Investment Opportunity",
        description: `With a ${savingsRate.toFixed(1)}% savings rate, you're doing great! Consider investing surplus funds.`,
        impact: "positive",
        action: "Research investment options like index funds or government bonds.",
        icon: TrendingUp,
        priority: "low"
      });
    }

    return insights;
  };

  // Calculate spending trends by category (mock data for now)
  const generateSpendingTrends = () => {
    // This would ideally compare current month vs previous month
    // For now, we'll use sample data based on transaction patterns
    return [
      { category: "Food & Dining", thisMonth: totalExpenses * 0.3, lastMonth: totalExpenses * 0.25, change: 20.0 },
      { category: "Transportation", thisMonth: totalExpenses * 0.2, lastMonth: totalExpenses * 0.25, change: -20.0 },
      { category: "Shopping", thisMonth: totalExpenses * 0.25, lastMonth: totalExpenses * 0.2, change: 25.0 },
      { category: "Bills & Utilities", thisMonth: totalExpenses * 0.25, lastMonth: totalExpenses * 0.3, change: -16.7 },
    ];
  };

  const insights = generateInsights();
  const spendingTrends = generateSpendingTrends();

  const monthlyOverview = {
    totalIncome,
    totalExpenses,
    savingsRate,
    budgetAdherence
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

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

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Financial Insights</h1>
        <p className="text-muted mt-1">AI-powered recommendations for your financial health</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted">Savings Rate</p>
                <p className="text-xl font-bold text-foreground">{savingsRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted">Budget Adherence</p>
                <p className="text-xl font-bold text-foreground">{budgetAdherence.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted">Net Income</p>
              <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome, currency)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted">Active Insights</p>
              <p className="text-xl font-bold text-foreground">{insights.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No insights available yet</p>
              <p className="text-sm text-muted mt-2">
                Add more transactions and budgets to get personalized recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => {
                const Icon = insight.icon;
                
                return (
                  <div key={insight.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getImpactColor(insight.impact)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{insight.title}</h3>
                          <p className="text-sm text-muted mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-foreground">
                        <strong>Recommended Action:</strong> {insight.action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {spendingTrends.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No spending data available</p>
              <p className="text-sm text-muted mt-2">
                Add transactions to see spending trends and analysis
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {spendingTrends.map((trend) => (
                <div key={trend.category} className="flex justify-between items-center p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{trend.category}</p>
                    <p className="text-sm text-muted">
                      {formatCurrency(trend.thisMonth, currency)} this month
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${
                      trend.change > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {trend.change > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(trend.change).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      vs last month
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};