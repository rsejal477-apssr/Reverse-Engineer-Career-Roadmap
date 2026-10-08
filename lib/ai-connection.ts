import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { aiConnections } from "@/db/schema";
import { ApiError } from "./api-errors";
import { encryptConnection, decryptConnection } from "./connection-crypto";

export function canSaveConnection() {
  return typeof env.AI_CONNECTION_ENCRYPTION_KEY === "string" && /^[a-f0-9]{64}$/i.test(env.AI_CONNECTION_ENCRYPTION_KEY);
}
export async function readSavedConnection(ownerId: string) {
  if (!canSaveConnection()) return null;
  const records = await getDb().select({encryptedKey:aiConnections.encryptedKey}).from(aiConnections).where(eq(aiConnections.ownerId, ownerId)).limit(1);
  if (!records.length) return null;
  try { return await decryptConnection(records[0].encryptedKey, ownerId, env.AI_CONNECTION_ENCRYPTION_KEY!); }
  catch { throw new ApiError("Your saved Gemini connection could not be opened. Remove it and connect again.",503,"SAVED_CONNECTION_UNAVAILABLE"); }
}
export async function saveConnection(ownerId: string, apiKey: string) {
  if (!canSaveConnection()) throw new ApiError("Saving an AI connection is temporarily unavailable.",503,"CONNECTION_STORAGE_UNAVAILABLE");
  const encryptedKey = await encryptConnection(apiKey, ownerId, env.AI_CONNECTION_ENCRYPTION_KEY!);
  await getDb().insert(aiConnections).values({ownerId,encryptedKey,updatedAt:Date.now()})
    .onConflictDoUpdate({target:aiConnections.ownerId,set:{encryptedKey,updatedAt:Date.now()}});
}
export async function removeConnection(ownerId: string) {
  await getDb().delete(aiConnections).where(eq(aiConnections.ownerId, ownerId));
}
export async function connectionStatus(ownerId?: string) {
  const canSaveKey = canSaveConnection();
  let saved = false;
  if (ownerId && canSaveKey) {
    const records = await getDb().select({ownerId:aiConnections.ownerId}).from(aiConnections).where(eq(aiConnections.ownerId,ownerId)).limit(1);
    saved = records.length > 0;
  }
  const connectionSource = env.GEMINI_API_KEY ? "server" : saved ? "saved" : "none";
  return {aiConfigured:connectionSource !== "none",canSaveKey,connectionSource};
}
