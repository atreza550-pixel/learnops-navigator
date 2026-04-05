import { db, type DBModule, type DBLesson, type DBProgress } from "@/db/database";
import { fakeDelay, getCurrentUserId } from "./helpers";

export interface ModuleWithProgress extends DBModule {
  lessons: DBLesson[];
  progress: number; // 0-100
  completedLessons: string[];
  totalLessons: number;
}

export async function getAll(): Promise<ModuleWithProgress[]> {
  await fakeDelay();
  const modules = db.get<DBModule>("modules").sort((a, b) => a.order - b.order);
  const lessons = db.get<DBLesson>("lessons");
  const userId = getCurrentUserId();
  const progressRecords = userId ? db.findWhere<DBProgress>("progress", (p) => p.userId === userId) : [];

  return modules.map((mod) => {
    const modLessons = lessons.filter((l) => l.moduleId === mod.id).sort((a, b) => a.order - b.order);
    const prog = progressRecords.find((p) => p.moduleId === mod.id);
    const completedLessons = prog?.completedLessons || [];
    const total = modLessons.length;
    const progress = total > 0 ? Math.round((completedLessons.length / total) * 100) : 0;
    return { ...mod, lessons: modLessons, progress, completedLessons, totalLessons: total };
  });
}

export async function getById(id: string): Promise<ModuleWithProgress | null> {
  await fakeDelay();
  const mod = db.findById<DBModule>("modules", id);
  if (!mod) return null;
  const lessons = db.findWhere<DBLesson>("lessons", (l) => l.moduleId === id).sort((a, b) => a.order - b.order);
  const userId = getCurrentUserId();
  const prog = userId ? db.findWhere<DBProgress>("progress", (p) => p.userId === userId && p.moduleId === id)[0] : undefined;
  const completedLessons = prog?.completedLessons || [];
  const total = lessons.length;
  return { ...mod, lessons, progress: total > 0 ? Math.round((completedLessons.length / total) * 100) : 0, completedLessons, totalLessons: total };
}

export async function create(data: Omit<DBModule, "id">): Promise<DBModule> {
  await fakeDelay();
  return db.insert<DBModule>("modules", data);
}

export async function update(id: string, data: Partial<DBModule>): Promise<DBModule | undefined> {
  await fakeDelay();
  return db.update<DBModule>("modules", id, data);
}

export async function remove(id: string): Promise<void> {
  await fakeDelay();
  db.delete("modules", id);
  // Also delete lessons for this module
  const lessons = db.findWhere<DBLesson>("lessons", (l) => l.moduleId === id);
  lessons.forEach((l) => db.delete("lessons", l.id));
}
