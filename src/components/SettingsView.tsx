import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Settings,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  Database,
  Download,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useTheme } from "next-themes";
import { useProfile } from "@/hooks/useProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { currencies } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";

export const SettingsView = () => {
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile } = useProfile();
  const { settings, updateSettings } = useUserSettings();
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(settings?.low_balance_threshold?.toString() || "100");

  const handleCurrencyChange = async (newCurrency: string) => {
    if (!profile) return;
    
    try {
      await updateProfile({ preferred_currency: newCurrency });
      toast.success("Currency updated successfully");
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  };

  const handleThresholdUpdate = async () => {
    const threshold = parseFloat(lowBalanceThreshold);
    if (isNaN(threshold) || threshold < 0) {
      toast.error("Please enter a valid threshold amount");
      return;
    }

    try {
      await updateSettings({ low_balance_threshold: threshold });
      toast.success("Low balance threshold updated");
    } catch (error) {
      console.error("Error updating threshold:", error);
    }
  };

  const exportData = () => {
    toast.info("Data export feature coming soon");
  };

  const deleteAccount = () => {
    toast.error("Account deletion requires contacting support");
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-muted mt-1">Manage your app preferences and account settings</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-muted">Choose your preferred theme</p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Currency & Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="currency">Preferred Currency</Label>
                <p className="text-sm text-muted">All amounts will be displayed in this currency</p>
              </div>
              <Select 
                value={profile?.preferred_currency || "NGN"} 
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted">Receive important updates via email</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ email_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted">Get real-time alerts</p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ push_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted">Alert when budgets are exceeded</p>
                  </div>
                  <Switch
                    checked={settings.budget_alerts}
                    onCheckedChange={(checked) => 
                      updateSettings({ budget_alerts: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="threshold">Low Balance Alert Threshold</Label>
                  <div className="flex gap-2">
                    <Input
                      id="threshold"
                      type="number"
                      value={lowBalanceThreshold}
                      onChange={(e) => setLowBalanceThreshold(e.target.value)}
                      placeholder="Enter amount"
                      className="flex-1"
                    />
                    <Button onClick={handleThresholdUpdate} variant="outline">
                      Update
                    </Button>
                  </div>
                  <p className="text-sm text-muted">
                    Get notified when any account balance falls below this amount
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted">Loading notification settings...</p>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            <Separator />
            <div className="space-y-2">
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                onClick={deleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-destructive font-medium">Warning</p>
                  <p className="text-muted">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};