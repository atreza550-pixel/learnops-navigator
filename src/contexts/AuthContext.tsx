import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import * as authApi from "@/api/authApi";
import type { SafeUser } from "@/api/authApi";

export type User = SafeUser;

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => void;
  resetProgress: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  // On mount, try to restore session from token
  useEffect(() => {
    authApi.getMe().then((user) => {
      setCurrentUser(user);
      setChecked(true);
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await authApi.login(email, password);
      setCurrentUser(user);
      toast.success(`Bienvenue, ${user.name} !`);
      return true;
    } catch (e: any) {
      toast.error(e.message || "Identifiants incorrects");
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await authApi.register(name, email, password);
      setCurrentUser(user);
      toast.success("Compte créé avec succès !");
      return true;
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'inscription");
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setCurrentUser(null);
    toast.info("Déconnexion réussie");
  }, []);

  const updateCurrentUser = useCallback((updates: Partial<User>) => {
    setCurrentUser((prev) => prev ? { ...prev, ...updates } : null);
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await authApi.getMe();
    setCurrentUser(user);
  }, []);

  const resetProgress = useCallback(async () => {
    const { resetProgress: reset } = await import("@/api/usersApi");
    await reset();
    await refreshUser();
    toast.success("Progression réinitialisée");
  }, [refreshUser]);

  // Don't render children until we've checked the token
  if (!checked) return null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateCurrentUser,
        resetProgress,
        refreshUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
