import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, type LoginRequest, type RegisterRequest } from "../lib/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: string;
  income?: number;
  occupation?: string;
  state?: string;
  district?: string;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      authAPI.getMe(token)
        .then((userData) => {
          setUser(userData);
        })
        .catch((error) => {
          console.error("Failed to get user:", error);
          localStorage.removeItem("auth_token");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      localStorage.setItem("auth_token", response.token);
      setUser(response.user);
      
      toast({
        title: "Login Successful",
        description: "Welcome back to GConnect!",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      
      localStorage.setItem("auth_token", response.token);
      setUser(response.user);
      
      toast({
        title: "Registration Successful",
        description: "Welcome to GConnect! Please complete your profile to get personalized scheme recommendations.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
