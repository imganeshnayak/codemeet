import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Bell, Moon, Sun, LogOut, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { UserBlockchainBadge } from '@/components/UserBlockchainBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://codemeet-yaus.onrender.com/api';

// Activity interface
interface Activity {
  id: string;
  type: 'issue' | 'comment';
  title: string;
  date: string;
  status: string;
  blockchainTxHash?: string;
  blockchainVerified?: boolean;
  blockchainTimestamp?: string;
}

// User Stats interface
interface UserStats {
  totalIssues: number;
  totalCommunities: number;
  totalMessages: number;
  issuesByStatus: {
    pending?: number;
    'in-progress'?: number;
    resolved?: number;
    rejected?: number;
  };
}

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // User data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });
  
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pushNotifications: true,
    issueUpdates: true,
    communityMessages: false,
  });
  
  const [userStats, setUserStats] = useState<UserStats>({
    totalIssues: 0,
    totalCommunities: 0,
    totalMessages: 0,
    issuesByStatus: {},
  });
  

  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const token = localStorage.getItem('jan_awaaz_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('Profile API Response:', data);

      if (data.success) {
        const { user: userData, stats } = data.data;
        console.log('User Stats:', stats);
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          avatar: userData.avatar || '',
        });
        setNotifications(userData.notifications || notifications);
        setUserStats(stats);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch activity data
  const fetchActivity = async () => {
    try {
      setIsLoadingActivity(true);
      const token = localStorage.getItem('jan_awaaz_token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/profile/activity`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const token = localStorage.getItem('jan_awaaz_token');

      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
        setIsEditing(false);
        fetchProfile();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      setIsSavingNotifications(true);
      const token = localStorage.getItem('jan_awaaz_token');
      
      const updatedNotifications = { ...notifications, [key]: value };
      setNotifications(updatedNotifications);

      const res = await fetch(`${API_BASE_URL}/profile/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });

      const data = await res.json();

      if (!data.success) {
        // Revert on error
        setNotifications(notifications);
        toast({
          title: 'Error',
          description: data.message || 'Failed to update notification settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      setNotifications(notifications);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  // Calculate issue statistics for the chart
  const issueStats = [
    { 
      name: 'Resolved', 
      value: userStats.issuesByStatus.resolved || 0, 
      color: 'hsl(142, 71%, 45%)' 
    },
    { 
      name: 'Pending', 
      value: userStats.issuesByStatus.pending || 0, 
      color: 'hsl(45, 93%, 58%)' 
    },
    { 
      name: 'In Progress', 
      value: userStats.issuesByStatus['in-progress'] || 0, 
      color: 'hsl(217, 91%, 60%)' 
    },
  ].filter(stat => stat.value > 0); // Only show categories with values

  const totalIssues = userStats.totalIssues;

  if (isLoadingProfile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <img
                    src={profileData.avatar || user?.avatar}
                    alt={profileData.name || user?.name}
                    className="w-24 h-24 rounded-full ring-4 ring-primary/20"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profileData.name || user?.name}</h1>
                  <p className="text-muted-foreground mb-4">{profileData.email || user?.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge>Member since Oct 2025</Badge>
                    <Badge variant="outline">{totalIssues} Issues Reported</Badge>
                    <Badge variant="outline">{userStats.totalCommunities} Communities</Badge>
                  </div>
                </div>
                
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Issue Statistics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Issue Statistics</CardTitle>
              <CardDescription>Overview of your reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              {totalIssues === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Issues Reported Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start reporting issues in your community to see statistics here.
                  </p>
                  <Button onClick={() => navigate('/report-summary')}>
                    Report Your First Issue
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="h-[300px] flex items-center justify-center">
                    {issueStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={issueStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {issueStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>No data to display</p>
                      </div>
                    )}
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 gap-4">
                    {issueStats.map((stat, index) => (
                      <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="p-4 rounded-lg border border-border hover:shadow-md smooth-transition"
                        style={{ 
                          borderLeftWidth: '4px', 
                          borderLeftColor: stat.color 
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.name}</p>
                            <p className="text-3xl font-bold mt-1">{stat.value}</p>
                          </div>
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: stat.color }}
                          >
                            {Math.round((stat.value / totalIssues) * 100)}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Total Issues Card */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 rounded-lg bg-primary/10 border border-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Issues</p>
                          <p className="text-3xl font-bold mt-1 text-primary">{totalIssues}</p>
                        </div>
                        <div className="text-4xl">📊</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? 'default' : 'outline'}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St, City, State"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSaveProfile} 
                        className="gap-2"
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how Jan Awaaz looks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">
                          {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Email Updates</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('emailUpdates', checked)}
                      disabled={isSavingNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                      disabled={isSavingNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Issue Updates</p>
                      <p className="text-sm text-muted-foreground">Get notified about your reported issues</p>
                    </div>
                    <Switch
                      checked={notifications.issueUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('issueUpdates', checked)}
                      disabled={isSavingNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Community Messages</p>
                      <p className="text-sm text-muted-foreground">Notifications from your communities</p>
                    </div>
                    <Switch
                      checked={notifications.communityMessages}
                      onCheckedChange={(checked) => handleNotificationChange('communityMessages', checked)}
                      disabled={isSavingNotifications}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 smooth-transition"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xl">
                              {activity.type === 'issue' ? '📋' : '💬'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`status-${activity.status}`}>
                              {activity.status}
                            </Badge>
                            {activity.blockchainVerified && (
                              <UserBlockchainBadge
                                blockchainTxHash={activity.blockchainTxHash}
                                blockchainVerified={activity.blockchainVerified}
                                blockchainTimestamp={activity.blockchainTimestamp}
                                compact={true}
                              />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
