import { z } from "zod";
import { roadmapSchema, validateGraph } from "@/lib/roadmap";
import { ApiError, checkOrigin, requestJson, getApiKey, generateAdvice, errorResponse } from "@/lib/gemini";
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const {roadmap,milestoneId}=await requestJson(request,z.object({roadmap:roadmapSchema,milestoneId:z.string().max(60)}));
    validateGraph(roadmap.milestones);
    const milestone=roadmap.milestones.find(m=>m.id===milestoneId);
    if(!milestone) throw new ApiError("Milestone not found.",404);
    const advice=await generateAdvice(roadmap,milestone,await getApiKey(request));
    return Response.json({advice},{headers:{"Cache-Control":"no-store"}});
  } catch(error) {return errorResponse(error);}
}
