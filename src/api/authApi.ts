import { db, type DBUser } from "@/db/database";
import { fakeDelay, ApiError } from "./helpers";

export type SafeUser = Omit<DBUser, "password">;

function stripPassword(u: DBUser): SafeUser {
  const { password: _, ...rest } = u;
  return rest;
}

function generateToken(user: DBUser): string {
  return btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
}

export async function login(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
  await fakeDelay();
  const users = db.get<DBUser>("users");
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new ApiError(401, "Identifiants incorrects");
  const token = generateToken(user);
  localStorage.setItem("loj_token", token);
  // Update last active
  db.update("users", user.id, { lastActiveDate: new Date().toISOString().split("T")[0] });
  return { user: stripPassword(user), token };
}

export async function register(name: string, email: string, password: string): Promise<{ user: SafeUser; token: string }> {
  await fakeDelay();
  const users = db.get<DBUser>("users");
  if (users.find((u) => u.email === email)) throw new ApiError(409, "Cet email est déjà utilisé");
  const avatar = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#6366f1", "#f59e0b", "#10b981", "#0ea5e9", "#ec4899", "#8b5cf6", "#f97316", "#14b8a6"];
  const newUser: DBUser = {
    id: `u${Date.now()}`,
    name, email, password, role: "student", avatar,
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
    joinedAt: new Date().toISOString().split("T")[0],
    totalPoints: 0, streak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
    completedModules: [],
  };
  db.insert<DBUser>("users", newUser);
  const token = generateToken(newUser);
  localStorage.setItem("loj_token", token);
  return { user: stripPassword(newUser), token };
}

export async function logout(): Promise<void> {
  await fakeDelay(100, 200);
  localStorage.removeItem("loj_token");
}

export async function getMe(): Promise<SafeUser | null> {
  const token = localStorage.getItem("loj_token");
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp < Date.now()) {
      localStorage.removeItem("loj_token");
      return null;
    }
    const user = db.findById<DBUser>("users", decoded.userId);
    return user ? stripPassword(user) : null;
  } catch {
    return null;
  }
}
