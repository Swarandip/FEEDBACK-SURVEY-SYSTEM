import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend API URL
const API_URL = 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage and verify token on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');
    
    if (token && savedUser) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Verify token with backend
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const mappedUser: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.fullName,
          role: data.user.role,
          department: data.user.department,
          semester: data.user.semester,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        setUser(mappedUser);
        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, // Full name - backend matches username, email, or full_name
          password 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const mappedUser: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.fullName,
          role: data.user.role,
          department: data.user.department,
          semester: data.user.semester,
          createdAt: new Date().toISOString().split('T')[0]
        };

        setUser(mappedUser);
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
        setIsLoading(false);
        return true;
      }
      
      console.error('Login failed:', data.message);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          body: JSON.stringify({
            username: userData.name,
            email: userData.email,
            password: userData.password,
            fullName: userData.name,
            role: userData.role,
            department: userData.department || null,
            enrollmentNo: null,
            semester: userData.semester ?? null
          })
        });

        const data = await response.json().catch(() => ({}));

        if (data.success) {
          return true;
        }

        // Backend explicitly tells us why registration failed.
        throw new Error(data.message || 'Registration failed');
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch (error) {
      // Normalize fetch/timeout errors into user-friendly messages.
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Registration timed out. Check backend on http://localhost:5000/api/auth/register');
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
