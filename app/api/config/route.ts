import { connectionStatus } from "@/lib/ai-connection";
import { errorResponse } from "@/lib/gemini";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export const dynamic="force-dynamic";
export async function GET() {
  try {
    const user=await getChatGPTUser();
    return Response.json({...await connectionStatus(user?.userId),signedIn:!!user,displayName:user?.displayName??null},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return errorResponse(error); }
}
