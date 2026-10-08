import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ApiError, checkOrigin, requestJson, errorResponse, verifyGeminiKey } from "@/lib/gemini";
import { canSaveConnection, saveConnection, removeConnection, connectionStatus } from "@/lib/ai-connection";
export const dynamic="force-dynamic";
async function owner() {
  const user=await getChatGPTUser();
  if (!user) throw new ApiError("Sign in with ChatGPT to save your Gemini connection.",401,"SIGN_IN_REQUIRED");
  return user.userId;
}
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const ownerId=await owner();
    if (!canSaveConnection()) throw new ApiError("Saving an AI connection is temporarily unavailable.",503,"CONNECTION_STORAGE_UNAVAILABLE");
    const {key}=await requestJson(request,z.object({key:z.string().trim().min(16,"That API key does not look valid.").max(256)}));
    await verifyGeminiKey(key);
    await saveConnection(ownerId,key);
    return Response.json({...await connectionStatus(ownerId),saved:true},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return errorResponse(error); }
}
export async function DELETE(request:Request) {
  try {
    checkOrigin(request);
    const ownerId=await owner();
    await removeConnection(ownerId);
    return Response.json({...await connectionStatus(ownerId),removed:true},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return errorResponse(error); }
}
