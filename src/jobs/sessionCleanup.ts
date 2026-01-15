import { db } from "../db";
import { sessions } from "../db/schema";
import { lt } from "drizzle-orm";

export async function cleanupExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
