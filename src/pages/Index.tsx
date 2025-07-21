import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { AccountsView } from "@/components/AccountsView";
import { TransactionsView } from "@/components/TransactionsView";
import { BudgetView } from "@/components/BudgetView";
import { GoalsView } from "@/components/GoalsView";
import { InsightsView } from "@/components/InsightsView";
import { NotificationsView } from "@/components/NotificationsView";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <FinancialDashboard />;
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
      case 'settings':
        return (
          <div className="p-6 bg-background min-h-screen">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted mt-2">Account and app preferences coming soon...</p>
          </div>
        );
      default:
        return <FinancialDashboard />;
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1">
        {renderView()}
      </main>
    </div>
  );
};

export default Index;
