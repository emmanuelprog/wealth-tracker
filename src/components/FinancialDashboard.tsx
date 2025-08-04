import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  Plus, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Coffee,
  Home
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddTransactionForm } from "./forms/AddTransactionForm";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialDashboardProps {
  onViewChange?: (view: string) => void;
}

export const FinancialDashboard = ({ onViewChange }: FinancialDashboardProps) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Get real data from hooks
  const { accounts, loading: accountsLoading, getTotalBalance } = useAccounts();
  const { transactions, loading: transactionsLoading, getRecentTransactions, getTotalSpending, createTransaction } = useTransactions();
  const { budgets, loading: budgetsLoading, getTotalBudgetAmount } = useBudgets();
  const { categories } = useCategories();

  const totalBalance = getTotalBalance();
  const monthlyBudget = getTotalBudgetAmount();
  const monthlySpending = getTotalSpending(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const recentTransactions = getRecentTransactions(4);

  const isLoading = accountsLoading || transactionsLoading || budgetsLoading;

  const getTransactionIcon = (categoryName?: string) => {
    switch (categoryName?.toLowerCase()) {
      case "food & dining":
        return Coffee;
      case "shopping":
        return ShoppingCart;
      case "income":
        return DollarSign;
      case "bills & utilities":
        return Home;
      default:
        return CreditCard;
    }
  };

  const handleAddTransaction = async (transactionData: any) => {
    try {
      await createTransaction({
        account_id: transactionData.account_id,
        category_id: transactionData.category_id,
        merchant: transactionData.merchant,
        description: transactionData.description,
        amount: parseFloat(transactionData.amount),
        transaction_type: transactionData.transaction_type as "expense" | "income" | "transfer",
        transaction_date: transactionData.transaction_date,
        notes: transactionData.notes,
      });
      setShowAddTransaction(false);
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Here's your financial overview</p>
        </div>
        <Button onClick={() => setShowAddTransaction(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {balanceVisible ? `$${totalBalance.toLocaleString()}` : "••••••"}
                </p>
                <p className="text-sm text-muted-foreground">Total Balance</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setBalanceVisible(!balanceVisible)}
              >
                {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${monthlyBudget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${monthlySpending.toLocaleString()} spent
                </p>
                <div className="mt-2 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min((monthlySpending / monthlyBudget) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${monthlySpending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {monthlySpending > monthlyBudget ? "Over budget" : "Under budget"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const IconComponent = getTransactionIcon(transaction.category?.name);
              return (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-secondary">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.merchant || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category?.name || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.transaction_type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                      {transaction.transaction_type === 'expense' ? '-' : '+'}${Math.abs(Number(transaction.amount)).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(transaction.transaction_date).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-4">No transactions yet</p>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <AddTransactionForm 
            onSubmit={handleAddTransaction}
            onCancel={() => setShowAddTransaction(false)}
            accounts={accounts}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};