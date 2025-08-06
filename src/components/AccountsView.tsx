import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  Plus,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAccounts } from "@/hooks/useAccounts";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/currency";
import { AddAccountForm } from "@/components/forms/AddAccountForm";

export const AccountsView = () => {
  const [showBalances, setShowBalances] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const { user } = useAuth();
  const { accounts, loading, error, getTotalBalance } = useAccounts();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
      case 'savings':
        return <Banknote className="w-6 h-6" />;
      case 'credit':
        return <CreditCard className="w-6 h-6" />;
      case 'investment':
        return <TrendingUp className="w-6 h-6" />;
      default:
        return <Banknote className="w-6 h-6" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      case 'savings':
        return 'bg-green-100 text-green-800';
      case 'credit':
        return 'bg-orange-100 text-orange-800';
      case 'investment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBalance = (balance: number, type: string, currency: string) => {
    if (!showBalances) return "••••••";
    
    if (type === 'credit' && balance < 0) {
      return `${formatCurrency(Math.abs(balance), currency)} owed`;
    }
    
    return formatCurrency(balance, currency);
  };

  const totalNetWorth = getTotalBalance();

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
            <p className="text-muted mt-1">Manage all your financial accounts</p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted mt-1">Manage all your financial accounts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalances(!showBalances)}
          >
            {showBalances ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showBalances ? "Hide" : "Show"} Balances
          </Button>
          <Button size="sm" onClick={() => setShowAddAccount(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Net Worth Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted">Total Net Worth</p>
              <p className="text-3xl font-bold text-foreground">
                {showBalances ? formatCurrency(totalNetWorth, user?.user_metadata?.preferred_currency || 'NGN') : "••••••••"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Active Accounts</p>
              <p className="text-2xl font-semibold text-primary">{accounts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Banknote className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No accounts yet</h3>
            <p className="text-muted mb-4">Add your first account to start tracking your finances</p>
            <Button onClick={() => setShowAddAccount(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getAccountIcon(account.account_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <p className="text-sm text-muted">{account.institution_name || 'Bank Account'}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getAccountTypeColor(account.account_type)}>
                    {account.account_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted">
                      Available Balance
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {formatBalance(Number(account.balance), account.account_type, account.currency)}
                    </p>
                    {account.account_number_last_four && (
                      <p className="text-xs text-muted">
                        ••••{account.account_number_last_four}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted">
                      Last updated: {new Date(account.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Account Dialog */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent className="max-w-md p-0">
          <AddAccountForm onClose={() => setShowAddAccount(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};