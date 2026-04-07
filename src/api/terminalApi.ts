import { db } from "@/db/database";
import { fakeDelay, getCurrentUserId, ApiError } from "@/api/helpers";

export interface TerminalLab {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  objectives: string[];
  steps: {
    id: string;
    instruction: string;
    hint: string;
    expectedCommands: string[];
    successMessage: string;
  }[];
}

export interface TerminalProgress {
  userId: string;
  labId: string;
  completedAt: string;
  timeSpent: number;
}

export async function getLabs(): Promise<TerminalLab[]> {
  await fakeDelay(300, 500);
  return db.get<TerminalLab>("terminalLabs");
}

export async function getLabById(labId: string): Promise<TerminalLab> {
  await fakeDelay(200, 400);
  const lab = db.findById<TerminalLab>("terminalLabs", labId);
  if (!lab) throw new ApiError(404, "Lab introuvable");
  return lab;
}

export async function completeLab(labId: string, timeSpent: number): Promise<TerminalProgress> {
  await fakeDelay(300, 500);
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");

  const progress = db.get<TerminalProgress>("terminalProgress");
  const existing = progress.find(p => p.userId === userId && p.labId === labId);
  if (existing) return existing;

  const record: TerminalProgress = {
    userId,
    labId,
    completedAt: new Date().toISOString(),
    timeSpent,
  };
  progress.push(record);
  db.set("terminalProgress", progress);

  // Award points
  const users = db.get("users");
  const userIdx = users.findIndex((u: any) => u.id === userId);
  if (userIdx !== -1) {
    (users[userIdx] as any).totalPoints += 150;
    db.set("users", users);
  }

  return record;
}

export async function getMyProgress(): Promise<TerminalProgress[]> {
  await fakeDelay(200, 300);
  const userId = getCurrentUserId();
  if (!userId) return [];
  return db.get<TerminalProgress>("terminalProgress").filter(p => p.userId === userId);
}
