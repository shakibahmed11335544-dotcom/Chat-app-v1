import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
  status: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  error: string | null;
}

interface RegisterData {
  email?: string;
  username?: string;
  phone?: string;
  password: string;
  avatar?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const sessionId = localStorage.getItem('goponkotha_session');
    if (sessionId) {
      fetchProfile(sessionId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (sessionId: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        localStorage.removeItem('goponkotha_session');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('goponkotha_session');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('goponkotha_session', data.sessionId);
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: RegisterData): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('goponkotha_session', data.sessionId);
        setError(null); // Clear any previous errors
        return true;
      } else {
        setError(data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const sessionId = localStorage.getItem('goponkotha_session');
    
    if (sessionId) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('goponkotha_session');
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    const sessionId = localStorage.getItem('goponkotha_session');
    
    if (!sessionId) return false;
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
