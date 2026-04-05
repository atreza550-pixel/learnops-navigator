import { db, type DBUser, type DBModule, type DBLesson, type DBAttempt } from "@/db/database";
import { fakeDelay } from "./helpers";

export interface AdminStats {
  totalUsers: number;
  totalModules: number;
  totalLessons: number;
  quizAttempts: number;
  avgScore: number;
  activeToday: number;
}

export async function getStats(): Promise<AdminStats> {
  await fakeDelay();
  const users = db.get<DBUser>("users");
  const modules = db.get<DBModule>("modules");
  const lessons = db.get<DBLesson>("lessons");
  const attempts = db.get<DBAttempt>("attempts");
  const today = new Date().toISOString().split("T")[0];
  return {
    totalUsers: users.length,
    totalModules: modules.length,
    totalLessons: lessons.length,
    quizAttempts: attempts.length,
    avgScore: attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.percentage, 0) / attempts.length) : 0,
    activeToday: users.filter((u) => u.lastActiveDate === today).length,
  };
}

export interface AdminAnalytics {
  weekly: { week: string; newUsers: number; lessonsCompleted: number; quizzesPassed: number; avgScore: number }[];
  moduleCompletion: { name: string; completion: number; color: string }[];
  topLessons: { title: string; module: string; completions: number }[];
  activeUsers: { id: string; name: string; avatar: string; avatarColor: string; points: number; streak: number }[];
  roleDistribution: { name: string; value: number }[];
  dailyActivity: { day: string; inscriptions: number; leçons: number }[];
  quizScores: { name: string; score: number }[];
}

export async function getAnalytics(): Promise<AdminAnalytics> {
  await fakeDelay(400, 700);
  const users = db.get<DBUser>("users");
  const modules = db.get<DBModule>("modules");
  const attempts = db.get<DBAttempt>("attempts");

  const weekly = [
    { week: "Semaine 1", newUsers: 3, lessonsCompleted: 18, quizzesPassed: 5, avgScore: 74 },
    { week: "Semaine 2", newUsers: 2, lessonsCompleted: 24, quizzesPassed: 8, avgScore: 79 },
    { week: "Semaine 3", newUsers: 4, lessonsCompleted: 31, quizzesPassed: 11, avgScore: 76 },
    { week: "Semaine 4", newUsers: 1, lessonsCompleted: 15, quizzesPassed: 6, avgScore: 82 },
  ];

  const moduleCompletion = modules.map((m) => {
    const completedCount = users.filter((u) => u.completedModules.includes(m.id)).length;
    return { name: m.title.length > 15 ? m.title.slice(0, 15) + "…" : m.title, completion: Math.round((completedCount / Math.max(users.length, 1)) * 100), color: m.color };
  });

  const topLessons = [
    { title: "CI/CD Pipeline", module: "DevOps", completions: 42 },
    { title: "Docker Compose", module: "Docker", completions: 38 },
    { title: "Qu'est-ce que DevOps ?", module: "DevOps", completions: 35 },
    { title: "Architecture K8s", module: "Docker", completions: 28 },
    { title: "MLflow", module: "MLOps", completions: 22 },
  ];

  const activeUsers = users
    .filter((u) => u.role !== "admin")
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10)
    .map((u) => ({ id: u.id, name: u.name, avatar: u.avatar, avatarColor: u.avatarColor, points: u.totalPoints, streak: u.streak }));

  const students = users.filter((u) => u.role === "student").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const instructors = users.filter((u) => u.role === "instructor").length;

  const roleDistribution = [
    { name: "Étudiants", value: students },
    { name: "Admins", value: admins },
    ...(instructors > 0 ? [{ name: "Instructeurs", value: instructors }] : []),
  ];

  const dailyActivity = [
    { day: "Lun", inscriptions: 2, leçons: 8 },
    { day: "Mar", inscriptions: 1, leçons: 12 },
    { day: "Mer", inscriptions: 3, leçons: 6 },
    { day: "Jeu", inscriptions: 0, leçons: 15 },
    { day: "Ven", inscriptions: 2, leçons: 10 },
    { day: "Sam", inscriptions: 1, leçons: 4 },
    { day: "Dim", inscriptions: 0, leçons: 3 },
  ];

  // Aggregate quiz scores by module
  const quizScoreMap: Record<string, { total: number; count: number }> = {};
  attempts.forEach((a) => {
    const mod = modules.find((m) => m.id === a.moduleId);
    const name = mod ? `Quiz ${mod.title.split(" ")[0]}` : a.quizId;
    if (!quizScoreMap[name]) quizScoreMap[name] = { total: 0, count: 0 };
    quizScoreMap[name].total += a.percentage;
    quizScoreMap[name].count++;
  });
  const quizScores = Object.entries(quizScoreMap).map(([name, { total, count }]) => ({
    name, score: Math.round(total / count),
  }));

  return { weekly, moduleCompletion, topLessons, activeUsers, roleDistribution, dailyActivity, quizScores };
}
