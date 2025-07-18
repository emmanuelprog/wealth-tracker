import { Button } from "@/components/ui/button";
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Settings,
  User
} from "lucide-react";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Navigation = ({ activeView, onViewChange }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-card border-r border-border h-screen w-64 p-4 flex flex-col">
      {/* Logo/Brand */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">FinanceApp</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-11 ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted hover:text-foreground hover:bg-accent"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="border-t border-border pt-4 mt-4">
        <Button variant="ghost" className="w-full justify-start text-muted hover:text-foreground">
          <User className="w-5 h-5 mr-3" />
          John Doe
        </Button>
      </div>
    </nav>
  );
};