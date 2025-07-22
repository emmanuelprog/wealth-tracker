import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { AccountsView } from "@/components/AccountsView";
import { TransactionsView } from "@/components/TransactionsView";
import { BudgetView } from "@/components/BudgetView";
import { GoalsView } from "@/components/GoalsView";
import { InsightsView } from "@/components/InsightsView";
import { NotificationsView } from "@/components/NotificationsView";
import { ProfileView } from "@/components/ProfileView";

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
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return (
          <div className="p-6 bg-background min-h-screen">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted">Customize your app preferences</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Theme</span>
                    <div className="ml-4">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Currency</h3>
                  <p className="text-muted">Default: Nigerian Naira (₦)</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                  <p className="text-muted">Manage your notification preferences</p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Security</h3>
                  <p className="text-muted">Two-factor authentication, password reset</p>
                </div>
              </div>
            </div>
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
