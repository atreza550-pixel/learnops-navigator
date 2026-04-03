import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useDataStore, type UserWithPassword } from "@/stores/dataStore";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  avatar: string;
  joinedAt: string;
  totalPoints: number;
  streak: number;
  completedModules: string[];
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const stripPassword = (u: UserWithPassword): User => {
  const { password: _, ...rest } = u;
  return rest;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, addUser } = useDataStore();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("learnops_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("learnops_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("learnops_user");
    }
  }, [currentUser]);

  const login = useCallback((email: string, password: string): boolean => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(stripPassword(user));
      toast.success(`Bienvenue, ${user.name} !`);
      return true;
    }
    toast.error("Email ou mot de passe incorrect");
    return false;
  }, [users]);

  const register = useCallback((name: string, email: string, password: string): boolean => {
    if (users.find((u) => u.email === email)) {
      toast.error("Cet email est déjà utilisé");
      return false;
    }
    addUser({ name, email, password, role: "student" });
    const newUser = useDataStore.getState().users.find((u) => u.email === email);
    if (newUser) {
      setCurrentUser(stripPassword(newUser));
      toast.success("Compte créé avec succès !");
      return true;
    }
    return false;
  }, [users, addUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    toast.info("Déconnexion réussie");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
