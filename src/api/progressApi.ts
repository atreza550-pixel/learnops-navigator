import { db, type DBUser, type DBProgress, type DBModule, type DBLesson, type DBAttempt } from "@/db/database";
import { fakeDelay, getCurrentUserId } from "./helpers";

export interface MyProgress {
  modules: {
    id: string; title: string; color: string; icon: string;
    totalLessons: number; completedLessons: number; progress: number;
    quizPassed: boolean; quizScore: number | null;
  }[];
  globalPercent: number;
  totalLessons: number;
  completedLessons: number;
  totalPoints: number;
  streak: number;
  badges: { id: string; icon: string; name: string; desc: string; earned: boolean }[];
  hasCertificate: boolean;
  quizAttempts: DBAttempt[];
}

const BADGES = [
  { id: "first_step", icon: "🚀", name: "Premier Pas", desc: "1ère leçon complétée", check: (u: DBUser, progCount: number) => progCount > 0 },
  { id: "on_fire", icon: "🔥", name: "En feu", desc: "7 jours de streak", check: (u: DBUser) => u.streak >= 7 },
  { id: "devops_master", icon: "🏆", name: "Maître DevOps", desc: "Modules DevOps + Git + Docker", check: (u: DBUser) => ["mod1", "mod2", "mod3"].every((m) => u.completedModules.includes(m)) },
  { id: "data_scientist", icon: "🧠", name: "Data Scientist", desc: "Module MLOps complété", check: (u: DBUser) => u.completedModules.includes("mod4") },
  { id: "speed_learner", icon: "⚡", name: "Speed Learner", desc: "Module en moins d'1 jour", check: () => false },
];

export async function getMyProgress(): Promise<MyProgress | null> {
  await fakeDelay();
  const userId = getCurrentUserId();
  if (!userId) return null;

  const user = db.findById<DBUser>("users", userId);
  if (!user) return null;

  const allModules = db.get<DBModule>("modules").sort((a, b) => a.order - b.order);
  const allLessons = db.get<DBLesson>("lessons");
  const allProgress = db.findWhere<DBProgress>("progress", (p) => p.userId === userId);
  const allAttempts = db.findWhere<DBAttempt>("attempts", (a) => a.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let totalLessons = 0;
  let completedLessons = 0;

  const modules = allModules.map((mod) => {
    const modLessons = allLessons.filter((l) => l.moduleId === mod.id);
    const prog = allProgress.find((p) => p.moduleId === mod.id);
    const completed = prog?.completedLessons?.length || 0;
    totalLessons += modLessons.length;
    completedLessons += completed;
    return {
      id: mod.id, title: mod.title, color: mod.color, icon: mod.icon,
      totalLessons: modLessons.length, completedLessons: completed,
      progress: modLessons.length > 0 ? Math.round((completed / modLessons.length) * 100) : 0,
      quizPassed: prog?.quizPassed || false, quizScore: prog?.quizScore ?? null,
    };
  });

  const globalPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hasCertificate = allModules.every((m) => user.completedModules.includes(m.id)) &&
    allProgress.filter((p) => p.quizPassed).length >= allModules.length;

  const badges = BADGES.map((b) => ({
    id: b.id, icon: b.icon, name: b.name, desc: b.desc,
    earned: b.check(user, completedLessons),
  }));

  return {
    modules, globalPercent, totalLessons, completedLessons,
    totalPoints: user.totalPoints, streak: user.streak,
    badges, hasCertificate, quizAttempts: allAttempts,
  };
}

export async function getActivityCalendar(): Promise<{ date: string; count: number }[]> {
  await fakeDelay(200, 400);
  const userId = getCurrentUserId();
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    // Seeded random based on userId + date
    const seed = (userId || "x").charCodeAt(0) * 31 + i * 7;
    const count = seed % 5 === 0 ? 0 : (seed % 4) + 1;
    days.push({ date: dateStr, count: i === 0 ? Math.max(count, 1) : count });
  }
  return days;
}
