import { inputSchema } from "@/lib/roadmap";
import { checkOrigin, requestJson, getApiKey, generateRoadmap, errorResponse } from "@/lib/gemini";
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const input=await requestJson(request,inputSchema);
    const roadmap=await generateRoadmap(input,await getApiKey(request));
    return Response.json({roadmap},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return errorResponse(error); }
}
