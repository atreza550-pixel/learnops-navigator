import { db, type DBLesson, type DBProgress, type DBUser, type DBNotification, type DBModule } from "@/db/database";
import { fakeDelay, getCurrentUserId, ApiError } from "./helpers";

export interface LessonWithStatus extends DBLesson {
  completed: boolean;
}

export async function getByModule(moduleId: string): Promise<LessonWithStatus[]> {
  await fakeDelay(200, 400);
  const lessons = db.findWhere<DBLesson>("lessons", (l) => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
  const userId = getCurrentUserId();
  const prog = userId ? db.findWhere<DBProgress>("progress", (p) => p.userId === userId && p.moduleId === moduleId)[0] : undefined;
  const completed = prog?.completedLessons || [];
  return lessons.map((l) => ({ ...l, completed: completed.includes(l.id) }));
}

export async function getById(lessonId: string): Promise<LessonWithStatus | null> {
  await fakeDelay(200, 400);
  const lesson = db.findById<DBLesson>("lessons", lessonId);
  if (!lesson) return null;
  const userId = getCurrentUserId();
  const prog = userId ? db.findWhere<DBProgress>("progress", (p) => p.userId === userId && p.moduleId === lesson.moduleId)[0] : undefined;
  return { ...lesson, completed: prog?.completedLessons?.includes(lessonId) || false };
}

export interface CompleteResult {
  pointsEarned: number;
  totalProgress: number;
  badgesUnlocked: string[];
  moduleCompleted: boolean;
}

export async function complete(lessonId: string): Promise<CompleteResult> {
  await fakeDelay(400, 700);
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");

  const lesson = db.findById<DBLesson>("lessons", lessonId);
  if (!lesson) throw new ApiError(404, "Leçon introuvable");

  // Get or create progress
  let prog = db.findWhere<DBProgress>("progress", (p) => p.userId === userId && p.moduleId === lesson.moduleId)[0];
  if (!prog) {
    prog = db.insert("progress", {
      id: `p${Date.now()}`, userId, moduleId: lesson.moduleId,
      completedLessons: [], quizPassed: false, quizScore: null,
    });
  }

  if (!prog.completedLessons.includes(lessonId)) {
    prog.completedLessons = [...prog.completedLessons, lessonId];
    db.update("progress", prog.id, { completedLessons: prog.completedLessons });
  }

  // Award points
  const pointsEarned = 25;
  const user = db.findById<DBUser>("users", userId);
  if (user) {
    db.update("users", userId, { totalPoints: user.totalPoints + pointsEarned, lastActiveDate: new Date().toISOString().split("T")[0] });
  }

  // Check if module is fully complete
  const allLessons = db.findWhere<DBLesson>("lessons", (l) => l.moduleId === lesson.moduleId);
  const moduleCompleted = allLessons.every((l) => prog!.completedLessons.includes(l.id));
  const totalProgress = Math.round((prog.completedLessons.length / allLessons.length) * 100);

  // Check badges
  const badgesUnlocked: string[] = [];
  if (prog.completedLessons.length === 1 && !user?.completedModules.length) {
    badgesUnlocked.push("Premier Pas 🚀");
  }

  // Create notification
  db.insert("notifications", {
    id: `n${Date.now()}`, userId, type: "success",
    message: `Leçon "${lesson.title}" complétée ! +${pointsEarned} pts`,
    time: "À l'instant", read: false, createdAt: new Date().toISOString(),
  });

  if (badgesUnlocked.length > 0) {
    db.insert("notifications", {
      id: `n${Date.now() + 1}`, userId, type: "trophy",
      message: `Badge débloqué : ${badgesUnlocked.join(", ")} !`,
      time: "À l'instant", read: false, createdAt: new Date().toISOString(),
    });
  }

  return { pointsEarned, totalProgress, badgesUnlocked, moduleCompleted };
}

// Admin CRUD
export async function createLesson(data: Omit<DBLesson, "id">): Promise<DBLesson> {
  await fakeDelay();
  return db.insert("lessons", data);
}

export async function updateLesson(id: string, data: Partial<DBLesson>): Promise<DBLesson | undefined> {
  await fakeDelay();
  return db.update("lessons", id, data);
}

export async function deleteLesson(id: string): Promise<void> {
  await fakeDelay();
  db.delete("lessons", id);
}

export async function reorderLessons(moduleId: string, fromIndex: number, toIndex: number): Promise<void> {
  await fakeDelay(100, 200);
  const lessons = db.findWhere<DBLesson>("lessons", (l) => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
  const [moved] = lessons.splice(fromIndex, 1);
  lessons.splice(toIndex, 0, moved);
  lessons.forEach((l, i) => db.update("lessons", l.id, { order: i + 1 }));
}
