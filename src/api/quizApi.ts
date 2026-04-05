import { db, type DBQuiz, type DBAttempt, type DBUser, type DBProgress, type DBNotification } from "@/db/database";
import { fakeDelay, getCurrentUserId, ApiError } from "./helpers";

export async function getByModule(moduleId: string): Promise<DBQuiz | null> {
  await fakeDelay();
  return db.findWhere<DBQuiz>("quizzes", (q) => q.moduleId === moduleId)[0] || null;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  correctAnswers: number[];
  pointsEarned: number;
  moduleCompleted: boolean;
}

export async function submit(quizId: string, answers: number[]): Promise<QuizResult> {
  await fakeDelay(800, 1500); // Longer delay to simulate "grading"
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");

  const quiz = db.findById<DBQuiz>("quizzes", quizId);
  if (!quiz) throw new ApiError(404, "Quiz introuvable");

  const correctAnswers = quiz.questions.map((q) => q.correctAnswer);
  const score = answers.reduce((acc, ans, i) => acc + (ans === correctAnswers[i] ? 1 : 0), 0);
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= quiz.passingScore;

  // Save attempt
  db.insert("attempts", {
    id: `a${Date.now()}`, userId, moduleId: quiz.moduleId, quizId,
    score, total, percentage, passed,
    date: new Date().toISOString(), duration: `${Math.floor(Math.random() * 5 + 3)}min`,
    answers,
  });

  // Award points
  const pointsEarned = passed ? percentage * 2 : Math.floor(percentage * 0.5);
  const user = db.findById<DBUser>("users", userId);
  if (user) {
    const updates: Partial<DBUser> = { totalPoints: user.totalPoints + pointsEarned };
    if (passed && !user.completedModules.includes(quiz.moduleId)) {
      updates.completedModules = [...user.completedModules, quiz.moduleId];
    }
    db.update("users", userId, updates);
  }

  // Update progress
  const prog = db.findWhere<DBProgress>("progress", (p) => p.userId === userId && p.moduleId === quiz.moduleId)[0];
  if (prog && passed) {
    db.update("progress", prog.id, { quizPassed: true, quizScore: percentage });
  }

  // Notification
  db.insert("notifications", {
    id: `n${Date.now()}`, userId, type: passed ? "success" : "warning",
    message: passed ? `Quiz "${quiz.title}" réussi avec ${percentage}% ! +${pointsEarned} pts` : `Quiz "${quiz.title}" échoué (${percentage}%). Réessayez !`,
    time: "À l'instant", read: false, createdAt: new Date().toISOString(),
  });

  const moduleCompleted = passed && !(user?.completedModules.includes(quiz.moduleId));

  return { score, total, percentage, passed, correctAnswers, pointsEarned, moduleCompleted };
}
