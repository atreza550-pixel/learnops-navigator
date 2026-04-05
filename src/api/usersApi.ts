import { db, type DBUser } from "@/db/database";
import { fakeDelay, getCurrentUserId, ApiError } from "./helpers";
import type { SafeUser } from "./authApi";

function strip(u: DBUser): SafeUser {
  const { password: _, ...rest } = u;
  return rest;
}

export async function getAll(): Promise<SafeUser[]> {
  await fakeDelay();
  return db.get<DBUser>("users").map(strip);
}

export async function getById(id: string): Promise<SafeUser | null> {
  await fakeDelay();
  const u = db.findById<DBUser>("users", id);
  return u ? strip(u) : null;
}

export async function update(id: string, data: Partial<DBUser>): Promise<SafeUser | undefined> {
  await fakeDelay();
  const updated = db.update("users", id, data);
  return updated ? strip(updated) : undefined;
}

export async function remove(id: string): Promise<void> {
  await fakeDelay();
  db.delete("users", id);
}

export async function create(data: { name: string; email: string; password: string; role: DBUser["role"] }): Promise<SafeUser> {
  await fakeDelay();
  const existing = db.findWhere<DBUser>("users", (u) => u.email === data.email);
  if (existing.length > 0) throw new ApiError(409, "Cet email existe déjà");
  const avatar = data.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#6366f1", "#f59e0b", "#10b981", "#0ea5e9", "#ec4899"];
  const newUser = db.insert("users", {
    id: `u${Date.now()}`, ...data, avatar,
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
    joinedAt: new Date().toISOString().split("T")[0],
    totalPoints: 0, streak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
    completedModules: [],
  });
  return strip(newUser);
}

export async function getLeaderboard(): Promise<SafeUser[]> {
  await fakeDelay();
  return db.get<DBUser>("users")
    .filter((u) => u.role !== "admin")
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10)
    .map(strip);
}

export async function updateProfile(data: { name?: string; email?: string }): Promise<SafeUser | undefined> {
  await fakeDelay();
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");
  const updates: Partial<DBUser> = {};
  if (data.name) {
    updates.name = data.name;
    updates.avatar = data.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }
  if (data.email) updates.email = data.email;
  const updated = db.update("users", userId, updates);
  return updated ? strip(updated) : undefined;
}

export async function changePassword(): Promise<void> {
  await fakeDelay();
  // Fake — always succeeds
}

export async function resetProgress(): Promise<void> {
  await fakeDelay();
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");
  db.update("users", userId, { completedModules: [], totalPoints: 0, streak: 0 });
  // Delete progress records
  const progs = db.findWhere<any>("progress", (p: any) => p.userId === userId);
  progs.forEach((p: any) => db.delete("progress", p.id));
  // Delete attempts
  const attempts = db.findWhere<any>("attempts", (a: any) => a.userId === userId);
  attempts.forEach((a: any) => db.delete("attempts", a.id));
}
