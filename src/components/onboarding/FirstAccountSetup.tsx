import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Banknote } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

interface FirstAccountSetupProps {
  preferredCurrency: string;
  onComplete: () => void;
}

export const FirstAccountSetup = ({ preferredCurrency, onComplete }: FirstAccountSetupProps) => {
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings" | "investment" | "credit_card" | "loan" | "other">("checking");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createAccount } = useAccounts();
  const { toast } = useToast();

  const accountTypes = [
    { value: "checking", label: "Checking Account" },
    { value: "savings", label: "Savings Account" },
    { value: "credit_card", label: "Credit Card" },
    { value: "investment", label: "Investment Account" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const balance = parseFloat(initialBalance) || 0;
      
      await createAccount({
        name: accountName,
        account_type: accountType,
        balance: balance,
        currency: preferredCurrency,
        is_active: true
      });

      toast({
        title: "Account Created!",
        description: `Your ${accountName} account has been set up successfully.`,
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      toast({
        title: "Setup Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Banknote className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Create Your First Account</h1>
          <p className="text-muted-foreground">Let's add your primary account to get started</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              This will be your primary account for tracking finances
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  placeholder="e.g., Main Checking, Savings Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-type">Account Type</Label>
                <Select value={accountType} onValueChange={(value: any) => setAccountType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initial-balance">
                  Current Balance ({formatCurrency(0, preferredCurrency).replace('0', '').trim()})
                </Label>
                <Input
                  id="initial-balance"
                  type="number"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your current account balance (optional)
                </p>
              </div>
            </CardContent>
            
            <div className="px-6 pb-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating Account..." : "Create Account & Continue"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};