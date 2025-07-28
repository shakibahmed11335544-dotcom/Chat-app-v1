import { RequestHandler } from "express";
import { z } from "zod";

// User data store (in production, this would be a database)
const users = new Map<string, {
  id: string;
  email: string;
  username: string;
  phone?: string;
  password: string; // In production, this would be hashed
  avatar?: string;
  status: string;
  isOnline: boolean;
  lastSeen: Date;
}>();

// Session store (in production, use Redis or similar)
const sessions = new Map<string, string>(); // sessionId -> userId

const registerSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  avatar: z.string().optional(),
}).refine(data => data.email || data.username || data.phone, {
  message: "Either email, username, or phone is required"
});

const loginSchema = z.object({
  identifier: z.string(), // email, username, or phone
  password: z.string(),
});

export const handleRegister: RequestHandler = (req, res) => {
  try {
    const userData = registerSchema.parse(req.body);
    
    // Check if user already exists (but allow re-registration for demo purposes)
    const existingUser = Array.from(users.values()).find(user =>
      (userData.email && user.email === userData.email) ||
      (userData.username && user.username === userData.username) ||
      (userData.phone && user.phone === userData.phone)
    );

    if (existingUser) {
      // For demo purposes, update the existing user instead of rejecting
      const updatedUser = {
        ...existingUser,
        password: userData.password,
        avatar: userData.avatar || existingUser.avatar,
        isOnline: true,
        lastSeen: new Date()
      };

      users.set(existingUser.id, updatedUser);

      // Create session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessions.set(sessionId, existingUser.id);

      const { password, ...userResponse } = updatedUser;

      return res.json({
        success: true,
        user: userResponse,
        sessionId,
        message: "Account updated and logged in successfully"
      });
    }
    
    // Create new user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: userId,
      email: userData.email || '',
      username: userData.username || '',
      phone: userData.phone || '',
      password: userData.password, // In production, hash this
      avatar: userData.avatar || '',
      status: "Available",
      isOnline: true,
      lastSeen: new Date()
    };
    
    users.set(userId, newUser);
    
    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessions.set(sessionId, userId);
    
    // Return user data (without password)
    const { password, ...userResponse } = newUser;
    
    res.json({
      success: true,
      user: userResponse,
      sessionId,
      message: "User registered successfully"
    });
    
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError ? error.errors[0].message : "Registration failed" 
    });
  }
};

export const handleLogin: RequestHandler = (req, res) => {
  try {
    const loginData = loginSchema.parse(req.body);
    
    // Find user by identifier
    const user = Array.from(users.values()).find(user => 
      user.email === loginData.identifier || 
      user.username === loginData.identifier || 
      user.phone === loginData.identifier
    );
    
    if (!user || user.password !== loginData.password) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
    
    // Update user status
    user.isOnline = true;
    user.lastSeen = new Date();
    
    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessions.set(sessionId, user.id);
    
    // Return user data (without password)
    const { password, ...userResponse } = user;
    
    res.json({
      success: true,
      user: userResponse,
      sessionId,
      message: "Login successful"
    });
    
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError ? error.errors[0].message : "Login failed" 
    });
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (sessionId && sessions.has(sessionId)) {
    const userId = sessions.get(sessionId);
    if (userId && users.has(userId)) {
      const user = users.get(userId)!;
      user.isOnline = false;
      user.lastSeen = new Date();
    }
    sessions.delete(sessionId);
  }
  
  res.json({ success: true, message: "Logged out successfully" });
};

export const handleGetProfile: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const userId = sessions.get(sessionId)!;
  const user = users.get(userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  
  const { password, ...userResponse } = user;
  res.json({ success: true, user: userResponse });
};

export const handleUpdateProfile: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const userId = sessions.get(sessionId)!;
  const user = users.get(userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  
  // Update allowed fields
  const { username, status, avatar } = req.body;
  if (username) user.username = username;
  if (status) user.status = status;
  if (avatar) user.avatar = avatar;
  
  const { password, ...userResponse } = user;
  res.json({ success: true, user: userResponse, message: "Profile updated successfully" });
};

// Utility function to get user by session (for other routes)
export const getUserBySession = (sessionId: string) => {
  if (!sessionId || !sessions.has(sessionId)) return null;
  const userId = sessions.get(sessionId)!;
  return users.get(userId) || null;
};

// Get all users (for contact list)
export const handleGetUsers: RequestHandler = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const allUsers = Array.from(users.values()).map(user => {
    const { password, ...userResponse } = user;
    return userResponse;
  });

  res.json({ success: true, users: allUsers });
};

// Initialize demo users
export const initializeDemoUsers = () => {
  // Demo user 1
  users.set('demo_user_1', {
    id: 'demo_user_1',
    email: 'demo@goponkotha.com',
    username: 'demo',
    password: 'demo123',
    avatar: 'DU',
    status: 'Available',
    isOnline: true,
    lastSeen: new Date()
  });

  // Demo user 2
  users.set('demo_user_2', {
    id: 'demo_user_2',
    email: 'sarah@example.com',
    username: 'sarah',
    password: 'sarah123',
    avatar: 'SJ',
    status: 'Busy',
    isOnline: true,
    lastSeen: new Date()
  });

  // Demo user 3
  users.set('demo_user_3', {
    id: 'demo_user_3',
    email: 'alex@example.com',
    username: 'alex',
    password: 'alex123',
    avatar: 'AC',
    status: 'Away',
    isOnline: false,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000)
  });
};
