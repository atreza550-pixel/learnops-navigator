export const fakeDelay = (min = 300, max = 600) =>
  new Promise<void>((r) => setTimeout(r, min + Math.random() * (max - min)));

export function getToken(): string | null {
  return localStorage.getItem("loj_token");
}

export function decodeToken(token: string): { userId: string; role: string; exp: number } | null {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

export function getCurrentUserId(): string | null {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  if (decoded.exp < Date.now()) {
    localStorage.removeItem("loj_token");
    return null;
  }
  return decoded.userId;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
