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

export const InsightsView = () => {
  const insights = [
    {
      id: 1,
      type: "saving",
      title: "Great Progress on Emergency Fund!",
      description: "You're 37% towards your emergency fund goal. At your current rate, you'll reach it by November 2024.",
      impact: "positive",
      action: "Consider increasing monthly savings by ₦5,000 to reach your goal 2 months earlier.",
      icon: PiggyBank,
      priority: "medium"
    },
    {
      id: 2,
      type: "spending",
      title: "Dining Out Spending Alert",
      description: "Your dining expenses increased by 45% this month compared to last month.",
      impact: "negative",
      action: "Consider meal prepping or setting a weekly dining budget of ₦15,000.",
      icon: AlertTriangle,
      priority: "high"
    },
    {
      id: 3,
      type: "investment",
      title: "Investment Opportunity",
      description: "Your emergency fund is nearly complete. Consider starting to invest in index funds.",
      impact: "positive",
      action: "Research low-cost index funds and consider investing ₦20,000 monthly.",
      icon: TrendingUp,
      priority: "low"
    },
    {
      id: 4,
      type: "debt",
      title: "Credit Card Payoff Strategy",
      description: "Paying an extra ₦5,000 monthly could save you ₦18,000 in interest.",
      impact: "positive",
      action: "Increase your credit card payment from ₦25,000 to ₦30,000 monthly.",
      icon: CreditCard,
      priority: "high"
    }
  ];

  const spendingTrends = [
    { category: "Groceries", thisMonth: 45000, lastMonth: 42000, change: 7.1 },
    { category: "Transportation", thisMonth: 28000, lastMonth: 35000, change: -20.0 },
    { category: "Dining Out", thisMonth: 32000, lastMonth: 22000, change: 45.5 },
    { category: "Entertainment", thisMonth: 18000, lastMonth: 15000, change: 20.0 },
    { category: "Utilities", thisMonth: 25000, lastMonth: 24000, change: 4.2 }
  ];

  const monthlyOverview = {
    totalIncome: 180000,
    totalExpenses: 142000,
    savingsRate: 21.1,
    budgetAdherence: 89.3
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
                <p className="text-xl font-bold text-foreground">{monthlyOverview.savingsRate}%</p>
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
                <p className="text-xl font-bold text-foreground">{monthlyOverview.budgetAdherence}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted">Net Income</p>
              <p className="text-xl font-bold text-green-600">
                +₦{(monthlyOverview.totalIncome - monthlyOverview.totalExpenses).toLocaleString()}
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
        </CardContent>
      </Card>

      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {spendingTrends.map((trend) => (
              <div key={trend.category} className="flex justify-between items-center p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{trend.category}</p>
                  <p className="text-sm text-muted">
                    ₦{trend.thisMonth.toLocaleString()} this month
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
                      {Math.abs(trend.change)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    vs last month
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};