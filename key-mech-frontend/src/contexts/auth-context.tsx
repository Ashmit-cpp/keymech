import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authControllerMe } from '@/api/generated';
import { useAuthStore } from '@/stores/auth-store';

interface User {
  id: string;
  email: string;
  name?: string | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let isCurrent = true;

    async function checkAuth() {
      if (!token) {
        if (isCurrent) setIsLoading(false);
        return;
      }

      try {
        const response = await authControllerMe();
        if (isCurrent) setAuth(response.data, token);
      } catch {
        if (isCurrent) clearAuth();
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void checkAuth();

    return () => {
      isCurrent = false;
    };
  }, [clearAuth, setAuth, token]);

  function login(userData: User) {
    if (token) setAuth(userData, token);
  }

  function logout() {
    clearAuth();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
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
