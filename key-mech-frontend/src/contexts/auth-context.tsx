import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated by checking for access_token cookie
    // Since we're using httpOnly cookies, we can't directly read the cookie in JS
    // We'll verify authentication by making a request to a protected endpoint
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Try to get cart (which is now auth-aware)
      // If successful and has userId, we're authenticated
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const cart = await response.json();
        if (cart.userId) {
          // User is authenticated, fetch user details
          // For now, we'll just set a minimal user object
          // In a real app, you'd have a /auth/me endpoint
          setUser({ 
            id: cart.userId, 
            email: '', // Would come from /auth/me endpoint
          });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function login(userData: User) {
    setUser(userData);
    // Note: Cart refetch is handled in login/register mutations
  }

  function logout() {
    setUser(null);
    // Note: Cart refetch is handled in logout mutation
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
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

