import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  QrCode, 
  Share, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  UserPlus,
  Users,
  ArrowLeft,
  Camera,
  Shield,
  Bell,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService, User as UserType, ConnectionRequest } from '@/services/auth';
import { useTheme } from '@/contexts/ThemeContext';

export function Profile() {
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState<UserType | null>(authService.getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<UserType[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    bio: currentUser?.bio || '',
    privacy: currentUser?.privacy || {
      showLastSeen: 'everyone' as const,
      showProfilePhoto: 'everyone' as const,
      allowAddByUsername: true
    }
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    loadData();
    generateQRCode();
  }, []);

  const loadData = async () => {
    try {
      const requests = await authService.getConnectionRequests();
      const userConnections = await authService.getConnections();
      setConnectionRequests(requests);
      setConnections(userConnections);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const generateQRCode = () => {
    const qrData = authService.generateQRCode();
    setQrCodeData(qrData);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
        displayName: profileData.displayName,
        bio: profileData.bio,
        privacy: profileData.privacy
      });
      
      setCurrentUser(updatedUser);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendConnectionRequest = async () => {
    if (!searchUsername.trim()) return;

    setIsLoading(true);
    try {
      await authService.sendConnectionRequest(searchUsername);
      setMessage(`Connection request sent to @${searchUsername}!`);
      setSearchUsername('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await authService.acceptConnectionRequest(requestId);
      setMessage('Connection request accepted!');
      loadData(); // Refresh data
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to accept request');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full professional-button"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your account and connections</p>
            </div>
          </div>
          
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-xl professional-button">
            <span className="text-primary-foreground font-bold text-2xl tracking-tight">GK</span>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm">
            {message}
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30 backdrop-blur-sm">
            <TabsTrigger value="profile" className="professional-button">Profile</TabsTrigger>
            <TabsTrigger value="connections" className="professional-button">Connections</TabsTrigger>
            <TabsTrigger value="requests" className="professional-button">Requests</TabsTrigger>
            <TabsTrigger value="qr" className="professional-button">Share</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Manage your profile information and privacy settings</CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="professional-button"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                        {currentUser.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full professional-button"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{currentUser.displayName}</h3>
                    <p className="text-muted-foreground">@{currentUser.username}</p>
                    <Badge variant="outline" className="text-xs">
                      {currentUser.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      disabled={!isEditing}
                      className="professional-button"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell others about yourself..."
                      disabled={!isEditing}
                      className="professional-button"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Privacy Settings</Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">Last Seen</span>
                        </div>
                        <select
                          value={profileData.privacy.showLastSeen}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, showLastSeen: e.target.value as any }
                          }))}
                          disabled={!isEditing}
                          className="bg-input border border-border rounded px-3 py-1 text-sm professional-button"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="contacts">Contacts Only</option>
                          <option value="nobody">Nobody</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">Profile Photo</span>
                        </div>
                        <select
                          value={profileData.privacy.showProfilePhoto}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, showProfilePhoto: e.target.value as any }
                          }))}
                          disabled={!isEditing}
                          className="bg-input border border-border rounded px-3 py-1 text-sm professional-button"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="contacts">Contacts Only</option>
                          <option value="nobody">Nobody</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserPlus className="h-4 w-4" />
                          <span className="text-sm">Add by Username</span>
                        </div>
                        <Button
                          onClick={() => setProfileData(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, allowAddByUsername: !prev.privacy.allowAddByUsername }
                          }))}
                          disabled={!isEditing}
                          variant={profileData.privacy.allowAddByUsername ? "default" : "outline"}
                          size="sm"
                          className="professional-button"
                        >
                          {profileData.privacy.allowAddByUsername ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="professional-button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="professional-button"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle>Your Connections</CardTitle>
                <CardDescription>People you're connected with</CardDescription>
              </CardHeader>
              
              <CardContent>
                {connections.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
                    <p className="text-muted-foreground">Start connecting with people to chat</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connections.map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-3 border border-border/30 rounded-lg professional-button">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={connection.avatar} />
                            <AvatarFallback>{connection.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{connection.displayName}</h4>
                            <p className="text-sm text-muted-foreground">@{connection.username}</p>
                          </div>
                        </div>
                        <Badge variant={connection.isOnline ? "default" : "outline"}>
                          {connection.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connection Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-6">
              {/* Send Request */}
              <Card className="glassmorphism border-border/50">
                <CardHeader>
                  <CardTitle>Send Connection Request</CardTitle>
                  <CardDescription>Connect with someone by their username</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex space-x-2">
                    <Input
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      placeholder="Enter username"
                      className="professional-button"
                    />
                    <Button
                      onClick={handleSendConnectionRequest}
                      disabled={!searchUsername.trim() || isLoading}
                      className="professional-button"
                    >
                      {isLoading ? 'Sending...' : 'Send Request'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Requests */}
              <Card className="glassmorphism border-border/50">
                <CardHeader>
                  <CardTitle>Connection Requests</CardTitle>
                  <CardDescription>People who want to connect with you</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {connectionRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                      <p className="text-muted-foreground">You'll see connection requests here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {connectionRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border border-border/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={request.fromUser.avatar} />
                              <AvatarFallback>{request.fromUser.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{request.fromUser.displayName}</h4>
                              <p className="text-sm text-muted-foreground">@{request.fromUser.username}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleAcceptRequest(request.id)}
                              size="sm"
                              className="professional-button"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="professional-button"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr">
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle>Share Your Profile</CardTitle>
                <CardDescription>Let others connect with you easily</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-48 h-48 bg-white rounded-2xl p-4 mx-auto flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <QrCode className="h-24 w-24 text-slate-800 mx-auto mb-2" />
                      <p className="text-xs text-slate-600">QR Code</p>
                      <p className="text-xs font-mono text-slate-500">@{currentUser.username}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Scan this code to connect</p>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="bg-muted px-3 py-1 rounded text-sm">
                        gk.app/add/{currentUser.username}
                      </code>
                      <Button
                        onClick={() => copyToClipboard(`gk.app/add/${currentUser.username}`)}
                        size="sm"
                        variant="outline"
                        className="professional-button"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-2">
                  <Button className="professional-button">
                    <Share className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                  <Button variant="outline" className="professional-button">
                    <QrCode className="h-4 w-4 mr-2" />
                    Save QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
