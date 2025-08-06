import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, Target, PieChart } from "lucide-react";
import { getCurrencySymbol, getCurrencyLabel } from "@/lib/currency";

interface OnboardingWelcomeProps {
  userName: string;
  preferredCurrency: string;
  onNext: () => void;
}

export const OnboardingWelcome = ({ userName, preferredCurrency, onNext }: OnboardingWelcomeProps) => {
  const currencySymbol = getCurrencySymbol(preferredCurrency);
  const currencyLabel = getCurrencyLabel(preferredCurrency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to WealthTracker!</h1>
          <p className="text-muted-foreground mt-2">Hi {userName}, let's set up your financial dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Financial Journey Starts Here</CardTitle>
            <CardDescription>
              We'll help you get started with tracking your finances in {currencyLabel} ({currencySymbol})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <Wallet className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Track Accounts</h3>
                <p className="text-sm text-muted-foreground">Connect your bank accounts and track balances</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <PieChart className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Monitor Spending</h3>
                <p className="text-sm text-muted-foreground">Categorize transactions and set budgets</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Achieve Goals</h3>
                <p className="text-sm text-muted-foreground">Set and track your financial goals</p>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={onNext} size="lg" className="px-8">
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};