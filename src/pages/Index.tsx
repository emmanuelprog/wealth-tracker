import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts } from "@/hooks/useAccounts";
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

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, loading } = useAuth();
  const { accounts, loading: accountsLoading } = useAccounts();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/welcome');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Check if user needs onboarding (no accounts created yet)
    if (user && !accountsLoading && accounts.length === 0) {
      setShowOnboarding(true);
    }
  }, [user, accounts, accountsLoading]);

  if (loading || accountsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
        return <ProfileView />;
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
