import { db, type DBNotification } from "@/db/database";
import { fakeDelay, getCurrentUserId } from "./helpers";

export async function getAll(): Promise<DBNotification[]> {
  await fakeDelay(200, 400);
  const userId = getCurrentUserId();
  if (!userId) return [];
  return db.findWhere<DBNotification>("notifications", (n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markRead(id: string): Promise<void> {
  await fakeDelay(100, 200);
  db.update("notifications", id, { read: true });
}

export async function markAllRead(): Promise<void> {
  await fakeDelay(100, 200);
  const userId = getCurrentUserId();
  if (!userId) return;
  const notifs = db.findWhere<DBNotification>("notifications", (n) => n.userId === userId && !n.read);
  notifs.forEach((n) => db.update("notifications", n.id, { read: true }));
}
