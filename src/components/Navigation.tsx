import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
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
  Menu,
  LogOut
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
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const NavigationContent = ({ isMobileSheet = false }: { isMobileSheet?: boolean }) => {
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
      await signOut();
    };

    const NavButton = ({ item, isActive }: { item: any; isActive: boolean }) => {
      const Icon = item.icon;
      const button = (
        <Button
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

      return isMobileSheet ? <SheetClose asChild>{button}</SheetClose> : button;
    };

    const ProfileButton = () => {
      const button = (
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted hover:text-foreground"
          onClick={() => onViewChange('profile')}
        >
          <User className="w-5 h-5 mr-3" />
          {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
        </Button>
      );

      return isMobileSheet ? <SheetClose asChild>{button}</SheetClose> : button;
    };

    const SignOutButton = () => {
      const button = (
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      );

      return isMobileSheet ? <SheetClose asChild>{button}</SheetClose> : button;
    };

    return (
      <div className="bg-card border-r border-border h-screen w-64 p-4 flex flex-col">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Wealth Tracker</h1>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <NavButton key={item.id} item={item} isActive={isActive} />
            );
          })}
        </div>

        {/* User Profile */}
        <div className="border-t border-border pt-4 mt-4 space-y-2">
          <ProfileButton />
          <SignOutButton />
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between p-4 bg-card border-b border-border md:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
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
              <NavigationContent isMobileSheet={true} />
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }

  return <NavigationContent />;
};