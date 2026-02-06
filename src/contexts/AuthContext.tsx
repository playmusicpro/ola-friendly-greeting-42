import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock user type - designed to match Supabase User structure
interface MockUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<{ error: string | null }>;
  logout: () => void;
  getSession: () => MockUser | null;
}

const AUTH_STORAGE_KEY = 'auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate a unique mock user ID
const generateMockUserId = () => {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedSession) {
          const parsedUser = JSON.parse(storedSession) as MockUser;
          setUser(parsedUser);
        }
      } catch (error) {
        // Invalid session data, clear it
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login function - accepts any valid email
  const login = async (email: string): Promise<{ error: string | null }> => {
    // Validate email format
    if (!email || !isValidEmail(email)) {
      return { error: 'Por favor, insira um email válido' };
    }

    // Create mock user object
    const mockUser: MockUser = {
      id: generateMockUserId(),
      email: email.toLowerCase().trim(),
      role: 'owner',
    };

    // Store in localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      return { error: null };
    } catch (error) {
      return { error: 'Erro ao salvar sessão' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  // Get current session
  const getSession = (): MockUser | null => {
    try {
      const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedSession) {
        return JSON.parse(storedSession) as MockUser;
      }
    } catch {
      // Invalid session
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export for future Supabase migration
export type { MockUser as User, AuthContextType };
