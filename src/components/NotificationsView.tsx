import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  CreditCard,
  TrendingDown,
  Target,
  Settings,
  Calendar,
  DollarSign
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useUserSettings } from "@/hooks/useUserSettings";
import { formatCurrency } from "@/lib/currency";
import { useProfile } from "@/hooks/useProfile";

export const NotificationsView = () => {
  const { notifications, loading, markAsRead, markAllAsRead, getUnreadCount } = useNotifications();
  const { settings, updateSettings } = useUserSettings();
  const { profile } = useProfile();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'account':
        return 'text-red-600 bg-red-100';
      case 'transaction':
        return 'text-blue-600 bg-blue-100';
      case 'budget':
        return 'text-orange-600 bg-orange-100';
      case 'goal':
        return 'text-green-600 bg-green-100';
      case 'system':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'account':
        return AlertTriangle;
      case 'transaction':
        return CreditCard;
      case 'budget':
        return TrendingDown;
      case 'goal':
        return Target;
      case 'system':
        return Bell;
      default:
        return Bell;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const unreadCount = getUnreadCount();

  if (loading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted mt-1">Stay updated on your financial activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted mx-auto mb-4" />
                  <p className="text-muted">No notifications yet</p>
                  <p className="text-sm text-muted mt-2">
                    You'll see important updates about your finances here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => {
                    const Icon = getTypeIcon(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border border-border rounded-lg cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-muted mt-1">{notification.message}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted text-right">
                          {formatTime(notification.created_at)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {settings ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ email_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Budget Alerts</p>
                      <p className="text-sm text-muted">When budgets are exceeded</p>
                    </div>
                    <Switch
                      checked={settings.budget_alerts}
                      onCheckedChange={(checked) => 
                        updateSettings({ budget_alerts: checked })
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Goal Reminders</p>
                      <p className="text-sm text-muted">Progress on savings goals</p>
                    </div>
                    <Switch
                      checked={settings.goal_reminders}
                      onCheckedChange={(checked) => 
                        updateSettings({ goal_reminders: checked })
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Transaction Notifications</p>
                      <p className="text-sm text-muted">All transaction updates</p>
                    </div>
                    <Switch
                      checked={settings.transaction_notifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ transaction_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Weekly Summary</p>
                      <p className="text-sm text-muted">Weekly financial summaries</p>
                    </div>
                    <Switch
                      checked={settings.weekly_summary}
                      onCheckedChange={(checked) => 
                        updateSettings({ weekly_summary: checked })
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Monthly Reports</p>
                      <p className="text-sm text-muted">Monthly financial summaries</p>
                    </div>
                    <Switch
                      checked={settings.monthly_report}
                      onCheckedChange={(checked) => 
                        updateSettings({ monthly_report: checked })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p className="text-muted">Loading settings...</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Set Balance Alert ({formatCurrency(settings?.low_balance_threshold || 100, profile?.preferred_currency)})
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Bill Reminders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Update Goal Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};