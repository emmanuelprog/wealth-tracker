import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAccounts } from "@/hooks/useAccounts";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { accountFormSchema, sanitizeString, type AccountFormData } from "@/lib/validation";
import { AlertCircle } from "lucide-react";
import { z } from "zod";

interface AddAccountFormProps {
  onClose: () => void;
}

export const AddAccountForm = ({ onClose }: AddAccountFormProps) => {
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createAccount } = useAccounts();
  const { user } = useAuth();
  const userCurrency = user?.user_metadata?.preferred_currency || 'NGN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Prepare and validate form data
      const formData: AccountFormData = {
        name: sanitizeString(accountName),
        account_type: accountType as any,
        institution_name: institutionName ? sanitizeString(institutionName) : undefined,
        balance: parseFloat(initialBalance) || 0,
        currency: userCurrency,
      };

      // Validate with Zod schema
      const validatedData = accountFormSchema.parse(formData);
      
      await createAccount({
        name: validatedData.name,
        account_type: validatedData.account_type,
        institution_name: validatedData.institution_name,
        balance: validatedData.balance,
        currency: validatedData.currency,
        is_active: true,
      });
      
      onClose();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0];
        setError(firstError?.message || "Invalid input data");
      } else {
        setError(err.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Account</h2>
      
      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="accountName">Account Name *</Label>
          <Input
            id="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., Main Checking"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="accountType">Account Type *</Label>
          <Select value={accountType} onValueChange={setAccountType}>
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Checking</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="institutionName">Bank/Institution</Label>
          <Input
            id="institutionName"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            placeholder="e.g., First Bank"
          />
        </div>
        
        <div>
          <Label htmlFor="initialBalance">
            Initial Balance * ({getCurrencySymbol(userCurrency)})
          </Label>
          <Input
            id="initialBalance"
            type="number"
            step="0.01"
            min="-1000000"
            max="1000000000"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="0.00"
            required
          />
          {initialBalance && (
            <p className="text-sm text-muted mt-1">
              {formatCurrency(parseFloat(initialBalance) || 0, userCurrency)}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </div>
      </form>
    </div>
  );
};