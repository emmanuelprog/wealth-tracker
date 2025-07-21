import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  Plus,
  Eye,
  EyeOff
} from "lucide-react";
import { useState } from "react";

export const AccountsView = () => {
  const [showBalances, setShowBalances] = useState(true);

  const accounts = [
    {
      id: 1,
      name: "Main Checking",
      type: "checking",
      bank: "First Bank",
      balance: 15750.00,
      lastTransaction: "2024-01-20",
      status: "active"
    },
    {
      id: 2,
      name: "Savings Account",
      type: "savings",
      bank: "GTBank",
      balance: 45200.00,
      lastTransaction: "2024-01-19",
      status: "active"
    },
    {
      id: 3,
      name: "Credit Card",
      type: "credit",
      bank: "Access Bank",
      balance: -2850.00,
      limit: 50000.00,
      lastTransaction: "2024-01-21",
      status: "active"
    },
    {
      id: 4,
      name: "Investment Portfolio",
      type: "investment",
      bank: "Stanbic IBTC",
      balance: 125000.00,
      performance: "+12.5%",
      lastTransaction: "2024-01-18",
      status: "active"
    }
  ];

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

  const formatBalance = (balance: number, type: string) => {
    if (!showBalances) return "••••••";
    
    const formatted = Math.abs(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    if (type === 'credit' && balance < 0) {
      return `₦${formatted} owed`;
    }
    
    return `₦${formatted}`;
  };

  const totalNetWorth = accounts.reduce((total, account) => {
    if (account.type === 'credit') {
      return total + account.balance; // credit balance is negative
    }
    return total + account.balance;
  }, 0);

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
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Net Worth Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted">Total Net Worth</p>
              <p className="text-3xl font-bold text-foreground">
                {showBalances ? `₦${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "••••••••"}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <p className="text-sm text-muted">{account.bank}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={getAccountTypeColor(account.type)}>
                  {account.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted">
                    {account.type === 'credit' ? 'Current Balance' : 'Available Balance'}
                  </p>
                  <p className={`text-xl font-bold ${
                    account.type === 'credit' && account.balance < 0 
                      ? 'text-red-600' 
                      : 'text-foreground'
                  }`}>
                    {formatBalance(account.balance, account.type)}
                  </p>
                  {account.type === 'credit' && account.limit && (
                    <p className="text-xs text-muted">
                      Limit: {showBalances ? `₦${account.limit.toLocaleString()}` : "••••••"}
                    </p>
                  )}
                  {account.type === 'investment' && account.performance && (
                    <p className="text-xs text-green-600">
                      Performance: {account.performance}
                    </p>
                  )}
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted">
                    Last transaction: {new Date(account.lastTransaction).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};