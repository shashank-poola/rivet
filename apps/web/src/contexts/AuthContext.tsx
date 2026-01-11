import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      api.setToken(storedToken);
      // Verify token is valid by fetching user data
      api
        .getPersonal()
        .then((data: any) => {
          setUser(data.user);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem("token");
          setToken(null);
          api.clearToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const response: any = await api.signIn(email, password);
    const { token, user } = response;

    setToken(token);
    setUser(user);
    api.setToken(token);
    localStorage.setItem("token", token);
  };

  const signUp = async (email: string, password: string) => {
    const response: any = await api.signUp(email, password);
    const { token, user } = response;

    setToken(token);
    setUser(user);
    api.setToken(token);
    localStorage.setItem("token", token);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setToken(null);
      setUser(null);
      api.clearToken();
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signIn,
        signUp,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
