import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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

interface UserWithPassword extends User {
  password: string;
}

const INITIAL_MOCK_USERS: UserWithPassword[] = [
  { id: "1", name: "Ahmed Ben Ali", email: "student@learnops.tn", password: "password123", role: "student", avatar: "AB", joinedAt: "2025-01-15", totalPoints: 1250, streak: 7, completedModules: ["mod1", "mod2"] },
  { id: "2", name: "Sameh Admin", email: "admin@learnops.tn", password: "admin123", role: "admin", avatar: "SA", joinedAt: "2024-09-01", totalPoints: 9999, streak: 30, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
  { id: "3", name: "Riahi Semah", email: "semah@learnops.tn", password: "semah123", role: "student", avatar: "RS", joinedAt: "2025-02-10", totalPoints: 680, streak: 3, completedModules: ["mod1"] },
];

let MOCK_USERS = [...INITIAL_MOCK_USERS];

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      toast.success(`Bienvenue, ${user.name} !`);
      return true;
    }
    toast.error("Email ou mot de passe incorrect");
    return false;
  }, []);

  const register = useCallback((name: string, email: string, password: string): boolean => {
    if (MOCK_USERS.find((u) => u.email === email)) {
      toast.error("Cet email est déjà utilisé");
      return false;
    }
    const newUser: UserWithPassword = {
      id: String(MOCK_USERS.length + 1),
      name,
      email,
      password,
      role: "student",
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      joinedAt: new Date().toISOString().split("T")[0],
      totalPoints: 0,
      streak: 0,
      completedModules: [],
    };
    MOCK_USERS.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    toast.success("Compte créé avec succès !");
    return true;
  }, []);

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
