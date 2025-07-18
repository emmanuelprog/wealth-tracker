import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Download
} from "lucide-react";
import { useState } from "react";

export const TransactionsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Mock transaction data
  const transactions = [
    { id: 1, merchant: "Salary Deposit", amount: 3200.00, category: "Income", date: "2024-01-15", type: "income", description: "Monthly salary" },
    { id: 2, merchant: "Whole Foods Market", amount: -127.45, category: "Groceries", date: "2024-01-14", type: "expense", description: "Weekly grocery shopping" },
    { id: 3, merchant: "Shell Gas Station", amount: -45.20, category: "Transportation", date: "2024-01-14", type: "expense", description: "Fuel" },
    { id: 4, merchant: "Netflix", amount: -15.99, category: "Entertainment", date: "2024-01-13", type: "expense", description: "Monthly subscription" },
    { id: 5, merchant: "Starbucks", amount: -8.75, category: "Food & Dining", date: "2024-01-13", type: "expense", description: "Coffee" },
    { id: 6, merchant: "Amazon", amount: -89.99, category: "Shopping", date: "2024-01-12", type: "expense", description: "Electronics" },
    { id: 7, merchant: "Freelance Project", amount: 850.00, category: "Income", date: "2024-01-10", type: "income", description: "Web development project" },
    { id: 8, merchant: "Electric Company", amount: -156.34, category: "Utilities", date: "2024-01-09", type: "expense", description: "Monthly electricity bill" },
  ];
  
  const categories = ["all", "Income", "Groceries", "Transportation", "Entertainment", "Food & Dining", "Shopping", "Utilities"];
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
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
      "Groceries": "bg-blue-100 text-blue-800 border-blue-200",
      "Transportation": "bg-purple-100 text-purple-800 border-purple-200",
      "Entertainment": "bg-pink-100 text-pink-800 border-pink-200",
      "Food & Dining": "bg-orange-100 text-orange-800 border-orange-200",
      "Shopping": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Utilities": "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

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
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
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
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-muted/50 text-muted'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{transaction.merchant}</h3>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(transaction.category)}
                    >
                      {transaction.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted mt-1">{transaction.description}</p>
                  <p className="text-xs text-muted">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-success' : 'text-foreground'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};