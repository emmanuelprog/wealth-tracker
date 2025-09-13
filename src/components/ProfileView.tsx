import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Shield,
  CreditCard,
  Bell,
  Wallet
} from "lucide-react";
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

interface ProfileViewProps {
  onViewChange: (view: string) => void;
}

export const ProfileView = ({ onViewChange }: ProfileViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    location: ""
  });

  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { getUnreadCount } = useNotifications();

  // Set form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        location: profile.location || ""
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        location: profile.location || ""
      });
    }
    setIsEditing(false);
  };

  const completedGoals = goals.filter(goal => goal.is_completed).length;
  const unreadNotifications = getUnreadCount();

  const stats = [
    { 
      label: "Total Transactions", 
      value: transactions.length.toString(), 
      icon: CreditCard 
    },
    { 
      label: "Active Accounts", 
      value: accounts.length.toString(), 
      icon: Wallet 
    },
    { 
      label: "Goals Achieved", 
      value: completedGoals.toString(), 
      icon: Calendar 
    },
    { 
      label: "Unread Notifications", 
      value: unreadNotifications.toString(), 
      icon: Bell 
    },
  ];

  if (profileLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-6">Profile not found.</div>;
  }

  const displayName = profile.display_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted">Manage your account information</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{displayName || "User"}</h3>
                  <Badge variant="secondary" className="mt-1">
                    Premium Member
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.first_name}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.last_name}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled={true}
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-foreground">Email Verification</span>
                </div>
                <Badge variant="default">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted" />
                  <span className="text-foreground">Phone Verification</span>
                </div>
                <Badge variant={profile.phone ? "default" : "secondary"}>
                  {profile.phone ? "Verified" : "Not Set"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted" />
                  <span className="text-foreground">Member Since</span>
                </div>
                <span className="text-muted">{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{stat.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onViewChange('settings')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onViewChange('notifications')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notification Center
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onViewChange('settings')}
              >
                <User className="w-4 h-4 mr-2" />
                App Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onViewChange('accounts')}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Manage Accounts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};