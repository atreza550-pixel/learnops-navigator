import { db, type DBNote } from "@/db/database";
import { fakeDelay, getCurrentUserId } from "./helpers";

export async function get(lessonId: string): Promise<string> {
  await fakeDelay(100, 200);
  const userId = getCurrentUserId();
  if (!userId) return "";
  const note = db.findWhere<DBNote>("notes", (n) => n.userId === userId && n.lessonId === lessonId)[0];
  return note?.content || "";
}

export async function save(lessonId: string, content: string): Promise<void> {
  await fakeDelay(100, 200);
  const userId = getCurrentUserId();
  if (!userId) return;
  const existing = db.findWhere<DBNote>("notes", (n) => n.userId === userId && n.lessonId === lessonId)[0];
  if (existing) {
    db.update("notes", existing.id, { content, updatedAt: new Date().toISOString() });
  } else {
    db.insert("notes", {
      id: `note${Date.now()}`, userId, lessonId, content, updatedAt: new Date().toISOString(),
    });
  }
}
