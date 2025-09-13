import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts } from "@/hooks/useAccounts";
import { useDataValidation } from "@/hooks/useDataValidation";
import { Navigation } from "@/components/Navigation";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { AccountsView } from "@/components/AccountsView";
import { TransactionsView } from "@/components/TransactionsView";
import { BudgetView } from "@/components/BudgetView";
import { GoalsView } from "@/components/GoalsView";
import { InsightsView } from "@/components/InsightsView";
import { NotificationsView } from "@/components/NotificationsView";
import { ProfileView } from "@/components/ProfileView";
import { SettingsView } from "@/components/SettingsView";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, loading } = useAuth();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { status: dataStatus, repairUserData } = useDataValidation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/welcome');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Check if user needs onboarding (no accounts created yet)
    if (user && !accountsLoading && !dataStatus.isValidating && dataStatus.isComplete && accounts.length === 0) {
      setShowOnboarding(true);
    }
  }, [user, accounts, accountsLoading, dataStatus]);

  if (loading || accountsLoading || dataStatus.isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : dataStatus.isValidating ? "Validating account setup..." : "Loading accounts..."}
          </p>
        </div>
      </div>
    );
  }

  // Show data repair option if user data is incomplete
  if (user && !dataStatus.isComplete && !dataStatus.isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <RefreshCw className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Account Setup Incomplete</h1>
            <p className="text-muted-foreground">
              Some essential data is missing from your account. Let's fix this to ensure everything works properly.
            </p>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground mb-6">
            <div className="flex items-center justify-between">
              <span>Profile</span>
              <span className={dataStatus.hasProfile ? "text-green-600" : "text-amber-600"}>
                {dataStatus.hasProfile ? "✓ Complete" : "⚠ Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Categories</span>
              <span className={dataStatus.hasCategories ? "text-green-600" : "text-amber-600"}>
                {dataStatus.hasCategories ? "✓ Complete" : "⚠ Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Settings</span>
              <span className={dataStatus.hasSettings ? "text-green-600" : "text-amber-600"}>
                {dataStatus.hasSettings ? "✓ Complete" : "⚠ Missing"}
              </span>
            </div>
          </div>
          <Button onClick={repairUserData} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Repair Account Data
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to welcome page
  }

  // Show onboarding flow if user hasn't created any accounts yet
  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={() => setShowOnboarding(false)} 
      />
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <FinancialDashboard onViewChange={setActiveView} />;
      case 'accounts':
        return <AccountsView />;
      case 'transactions':
        return <TransactionsView />;
      case 'budget':
        return <BudgetView />;
      case 'goals':
        return <GoalsView />;
      case 'insights':
        return <InsightsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView onViewChange={setActiveView} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <FinancialDashboard />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-background min-h-screen">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default Index;
