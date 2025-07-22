import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useState } from "react";
import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface FinancialDashboardProps {
  onViewChange?: (view: string) => void;
}

export const FinancialDashboard = ({ onViewChange }: FinancialDashboardProps) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  // Mock data - in real app this would come from API
  const totalBalance = 15420.50;
  const monthlyBudget = 3000;
  const spent = 1850;
  const budgetProgress = (spent / monthlyBudget) * 100;
  
  const recentTransactions = [
    { id: 1, merchant: "Grocery Store", amount: -85.50, category: "Food", date: "Today", type: "expense" },
    { id: 2, merchant: "Salary Deposit", amount: 3200.00, category: "Income", date: "Dec 15", type: "income" },
    { id: 3, merchant: "Gas Station", amount: -45.20, category: "Transportation", date: "Yesterday", type: "expense" },
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted">Here's your financial overview</p>
        </div>
        <Button 
          size="sm" 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowAddTransaction(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Total Balance</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {balanceVisible ? `₦${totalBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : "••••••"}
          </div>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Available balance
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Monthly Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ₦{(monthlyBudget - spent).toLocaleString()}
            </div>
            <p className="text-xs text-muted">
              ₦{spent.toLocaleString()} spent of ₦{monthlyBudget.toLocaleString()}
            </p>
            <Progress value={budgetProgress} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">This Month</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              -₦{spent.toLocaleString()}
            </div>
            <p className="text-xs text-muted">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80"
            onClick={() => onViewChange?.('transactions')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{transaction.merchant}</p>
                  <p className="text-sm text-muted">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <div className={`font-semibold ${
                transaction.type === 'income' ? 'text-success' : 'text-foreground'
              }`}>
                {transaction.type === 'income' ? '+' : ''}₦{Math.abs(transaction.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="p-0 max-w-md">
          <AddTransactionForm
            onSubmit={(transaction) => {
              console.log("New transaction:", transaction);
              setShowAddTransaction(false);
            }}
            onCancel={() => setShowAddTransaction(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};