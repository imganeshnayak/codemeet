import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database (hardcoded)
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@city.gov',
    password: 'demo123',
    name: 'Demo User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
  },
  {
    id: '2',
    email: 'john@city.gov',
    password: 'john123',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  }
];

// LocalStorage keys
const STORAGE_KEY_USER = 'civic_app_user';
const STORAGE_KEY_TOKEN = 'civic_app_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        avatar: foundUser.avatar
      };

      // Generate mock token
      const mockToken = `mock_token_${foundUser.id}_${Date.now()}`;

      // Store in localStorage
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEY_TOKEN, mockToken);
      
      setUser(userData);
      return true;
    }

    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      return false; // User already exists
    }

    // Create new user (in real app, this would be saved to backend)
    const newUser: User = {
      id: `${Date.now()}`,
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    // Generate mock token
    const mockToken = `mock_token_${newUser.id}_${Date.now()}`;

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEY_TOKEN, mockToken);
    
    setUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
