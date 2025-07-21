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
import { useState } from "react";

export const NotificationsView = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "alert",
      title: "Low Balance Warning",
      message: "Your checking account balance is below ₦10,000",
      timestamp: "2024-01-21T10:30:00Z",
      read: false,
      priority: "high",
      icon: AlertTriangle
    },
    {
      id: 2,
      type: "transaction",
      title: "Large Transaction Detected",
      message: "₦45,000 spent at Electronics Store",
      timestamp: "2024-01-21T08:15:00Z",
      read: false,
      priority: "medium",
      icon: CreditCard
    },
    {
      id: 3,
      type: "budget",
      title: "Budget Exceeded",
      message: "You've exceeded your dining budget by ₦8,000 this month",
      timestamp: "2024-01-20T18:45:00Z",
      read: true,
      priority: "medium",
      icon: TrendingDown
    },
    {
      id: 4,
      type: "goal",
      title: "Goal Achievement",
      message: "Congratulations! You've reached 50% of your emergency fund goal",
      timestamp: "2024-01-20T12:00:00Z",
      read: true,
      priority: "low",
      icon: Target
    },
    {
      id: 5,
      type: "reminder",
      title: "Bill Payment Reminder",
      message: "Credit card payment of ₦25,000 is due tomorrow",
      timestamp: "2024-01-19T09:00:00Z",
      read: false,
      priority: "high",
      icon: Calendar
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    lowBalance: true,
    largeTransactions: true,
    budgetAlerts: true,
    goalMilestones: true,
    billReminders: true,
    securityAlerts: true,
    weeklyReports: false,
    monthlyReports: true
  });

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
      case 'alert':
        return 'text-red-600 bg-red-100';
      case 'transaction':
        return 'text-blue-600 bg-blue-100';
      case 'budget':
        return 'text-orange-600 bg-orange-100';
      case 'goal':
        return 'text-green-600 bg-green-100';
      case 'reminder':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
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
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  
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
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                  );
                })}
              </div>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Low Balance Alerts</p>
                    <p className="text-sm text-muted">When account balance is low</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowBalance}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, lowBalance: checked }))
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Large Transactions</p>
                    <p className="text-sm text-muted">Transactions over ₦20,000</p>
                  </div>
                  <Switch
                    checked={notificationSettings.largeTransactions}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, largeTransactions: checked }))
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Budget Alerts</p>
                    <p className="text-sm text-muted">When budgets are exceeded</p>
                  </div>
                  <Switch
                    checked={notificationSettings.budgetAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, budgetAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Goal Milestones</p>
                    <p className="text-sm text-muted">Progress on savings goals</p>
                  </div>
                  <Switch
                    checked={notificationSettings.goalMilestones}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, goalMilestones: checked }))
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Bill Reminders</p>
                    <p className="text-sm text-muted">Upcoming payment due dates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.billReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, billReminders: checked }))
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Monthly Reports</p>
                    <p className="text-sm text-muted">Monthly financial summaries</p>
                  </div>
                  <Switch
                    checked={notificationSettings.monthlyReports}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, monthlyReports: checked }))
                    }
                  />
                </div>
              </div>
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
                  Set Balance Alert Threshold
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