export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
  privacy: {
    showLastSeen: 'everyone' | 'contacts' | 'nobody';
    showProfilePhoto: 'everyone' | 'contacts' | 'nobody';
    allowAddByUsername: boolean;
  };
  createdAt: string;
}

export interface LoginCredentials {
  identifier: string; // username or email
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    // Load user from localStorage
    const savedUser = localStorage.getItem('gk-user');
    const savedToken = localStorage.getItem('gk-token');
    
    if (savedUser && savedToken) {
      this.currentUser = JSON.parse(savedUser);
      this.token = savedToken;
    }
  }

  async signup(data: SignupData): Promise<{ user: User; token: string }> {
    try {
      // Simulate API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const result = await response.json();
      
      // Save to localStorage
      localStorage.setItem('gk-user', JSON.stringify(result.user));
      localStorage.setItem('gk-token', result.token);
      
      this.currentUser = result.user;
      this.token = result.token;
      
      return result;
    } catch (error) {
      // Fallback to local storage for demo
      const user: User = {
        id: Date.now().toString(),
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        isOnline: true,
        lastSeen: 'online',
        privacy: {
          showLastSeen: 'everyone',
          showProfilePhoto: 'everyone',
          allowAddByUsername: true,
        },
        createdAt: new Date().toISOString(),
      };

      const token = `gk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      localStorage.setItem('gk-user', JSON.stringify(user));
      localStorage.setItem('gk-token', token);
      
      this.currentUser = user;
      this.token = token;
      
      return { user, token };
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();
      
      localStorage.setItem('gk-user', JSON.stringify(result.user));
      localStorage.setItem('gk-token', result.token);
      
      this.currentUser = result.user;
      this.token = result.token;
      
      return result;
    } catch (error) {
      // Check if user exists in localStorage for demo
      const users = JSON.parse(localStorage.getItem('gk-all-users') || '[]');
      const user = users.find((u: User) => 
        (u.username === credentials.identifier || u.email === credentials.identifier)
      );

      if (!user) {
        throw new Error('User not found');
      }

      const token = `gk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      localStorage.setItem('gk-user', JSON.stringify(user));
      localStorage.setItem('gk-token', token);
      
      this.currentUser = user;
      this.token = token;
      
      return { user, token };
    }
  }

  async sendConnectionRequest(targetUsername: string): Promise<ConnectionRequest> {
    if (!this.currentUser) throw new Error('Not authenticated');

    // Find target user
    const users = JSON.parse(localStorage.getItem('gk-all-users') || '[]');
    const targetUser = users.find((u: User) => u.username === targetUsername);
    
    if (!targetUser) {
      throw new Error('User not found');
    }

    const request: ConnectionRequest = {
      id: Date.now().toString(),
      fromUserId: this.currentUser.id,
      toUserId: targetUser.id,
      fromUser: this.currentUser,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const requests = JSON.parse(localStorage.getItem('gk-connection-requests') || '[]');
    requests.push(request);
    localStorage.setItem('gk-connection-requests', JSON.stringify(requests));

    return request;
  }

  async acceptConnectionRequest(requestId: string): Promise<void> {
    const requests = JSON.parse(localStorage.getItem('gk-connection-requests') || '[]');
    const requestIndex = requests.findIndex((r: ConnectionRequest) => r.id === requestId);
    
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    requests[requestIndex].status = 'accepted';
    localStorage.setItem('gk-connection-requests', JSON.stringify(requests));

    // Add to connections
    const connections = JSON.parse(localStorage.getItem('gk-connections') || '[]');
    const request = requests[requestIndex];
    
    connections.push({
      userId1: request.fromUserId,
      userId2: request.toUserId,
      connectedAt: new Date().toISOString(),
    });
    
    localStorage.setItem('gk-connections', JSON.stringify(connections));
  }

  async getConnectionRequests(): Promise<ConnectionRequest[]> {
    if (!this.currentUser) return [];

    const requests = JSON.parse(localStorage.getItem('gk-connection-requests') || '[]');
    return requests.filter((r: ConnectionRequest) => 
      r.toUserId === this.currentUser!.id && r.status === 'pending'
    );
  }

  async getConnections(): Promise<User[]> {
    if (!this.currentUser) return [];

    const connections = JSON.parse(localStorage.getItem('gk-connections') || '[]');
    const users = JSON.parse(localStorage.getItem('gk-all-users') || '[]');
    
    const connectedUserIds = connections
      .filter((c: any) => c.userId1 === this.currentUser!.id || c.userId2 === this.currentUser!.id)
      .map((c: any) => c.userId1 === this.currentUser!.id ? c.userId2 : c.userId1);

    return users.filter((u: User) => connectedUserIds.includes(u.id));
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!(this.currentUser && this.token);
  }

  logout(): void {
    localStorage.removeItem('gk-user');
    localStorage.removeItem('gk-token');
    this.currentUser = null;
    this.token = null;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) throw new Error('Not authenticated');

    const updatedUser = { ...this.currentUser, ...updates };
    
    localStorage.setItem('gk-user', JSON.stringify(updatedUser));
    this.currentUser = updatedUser;

    // Update in all users list
    const users = JSON.parse(localStorage.getItem('gk-all-users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === this.currentUser!.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('gk-all-users', JSON.stringify(users));
    }

    return updatedUser;
  }

  generateQRCode(): string {
    if (!this.currentUser) return '';
    
    const qrData = {
      type: 'gk-user',
      username: this.currentUser.username,
      displayName: this.currentUser.displayName,
    };
    
    return `https://gk.app/add/${this.currentUser.username}?data=${btoa(JSON.stringify(qrData))}`;
  }
}

export const authService = new AuthService();
