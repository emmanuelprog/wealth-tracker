import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Settings,
  User,
  Wallet,
  Target,
  TrendingUp,
  Bell,
  Menu
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Navigation = ({ activeView, onViewChange }: NavigationProps) => {
  const isMobile = useIsMobile();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const NavigationContent = () => (
    <div className="bg-card border-r border-border h-screen w-64 p-4 flex flex-col">
      {/* Logo/Brand */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">WT</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Wealth Tracker</h1>
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
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted hover:text-foreground"
          onClick={() => onViewChange('profile')}
        >
          <User className="w-5 h-5 mr-3" />
          John Doe
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between p-4 bg-card border-b border-border md:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">WT</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Wealth Tracker</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }

  return <NavigationContent />;
};