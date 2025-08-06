import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Download,
  AlertCircle,
  Receipt
} from "lucide-react";
import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/currency";

export const TransactionsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions();
  const { categories } = useCategories();
  const userCurrency = user?.user_metadata?.preferred_currency || 'NGN';
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
    const matchesCategory = selectedCategory === "all" || transaction.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Income": "bg-success/10 text-success border-success/20",
      "Food & Dining": "bg-orange-100 text-orange-800 border-orange-200",
      "Transportation": "bg-purple-100 text-purple-800 border-purple-200",
      "Shopping": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Entertainment": "bg-pink-100 text-pink-800 border-pink-200",
      "Bills & Utilities": "bg-gray-100 text-gray-800 border-gray-200",
      "Healthcare": "bg-green-100 text-green-800 border-green-200",
      "Savings": "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted">Track and manage your financial activity</p>
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
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
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted">Track and manage your financial activity</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Activity ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
              <p className="text-muted">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your filters" 
                  : "Your transactions will appear here"}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.transaction_type === 'income' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-muted/50 text-muted'
                  }`}>
                    {transaction.transaction_type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{transaction.merchant || 'Unknown Merchant'}</h3>
                      {transaction.category && (
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(transaction.category.name)}
                        >
                          {transaction.category.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-1">{transaction.description || 'No description'}</p>
                    <p className="text-xs text-muted">{formatDate(transaction.transaction_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    transaction.transaction_type === 'income' ? 'text-success' : 'text-foreground'
                  }`}>
                    {transaction.transaction_type === 'income' ? '+' : ''}
                    {formatCurrency(Number(transaction.amount), userCurrency)}
                  </div>
                  {transaction.account && (
                    <p className="text-xs text-muted">{transaction.account.name}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};