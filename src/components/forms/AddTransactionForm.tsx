import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { transactionFormSchema, sanitizeString, type TransactionFormData } from "@/lib/validation";
import { CalendarIcon, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface AddTransactionFormProps {
  onSubmit: (transaction: any) => void;
  onCancel: () => void;
  accounts: any[];
  categories: any[];
}

export const AddTransactionForm = ({ onSubmit, onCancel, accounts, categories }: AddTransactionFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    merchant: "",
    amount: "",
    category_id: "",
    account_id: "",
    transaction_type: "expense",
    notes: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Prepare and validate form data
      const transactionData: TransactionFormData = {
        merchant: sanitizeString(formData.merchant),
        amount: parseFloat(formData.amount) || 0,
        category_id: formData.category_id || undefined,
        account_id: formData.account_id,
        transaction_type: formData.transaction_type as "income" | "expense",
        transaction_date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: formData.notes ? sanitizeString(formData.notes) : undefined,
        description: formData.description ? sanitizeString(formData.description) : undefined,
      };

      // Validate with Zod schema
      const validatedData = transactionFormSchema.parse(transactionData);
      
      onSubmit({
        merchant: validatedData.merchant,
        amount: validatedData.amount.toString(),
        category_id: validatedData.category_id,
        account_id: validatedData.account_id,
        transaction_type: validatedData.transaction_type,
        transaction_date: validatedData.transaction_date,
        notes: validatedData.notes,
        description: validatedData.description,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0];
        setError(firstError?.message || "Invalid input data");
      } else {
        setError(err.message || "Failed to create transaction");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant/Description</Label>
            <Input
              id="merchant"
              name="merchant"
              placeholder="e.g., Starbucks"
              value={formData.merchant}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max="1000000"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select 
              value={formData.account_id} 
              onValueChange={(value) => setFormData({...formData, account_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.account_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData({...formData, category_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.transaction_type} 
              onValueChange={(value) => setFormData({...formData, transaction_type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="Transaction description..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Transaction
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};