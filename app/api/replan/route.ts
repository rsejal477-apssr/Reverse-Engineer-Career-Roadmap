import { z } from "zod";
import { roadmapSchema, updateProgress, schedule } from "@/lib/roadmap";
import { checkOrigin, requestJson, errorResponse } from "@/lib/gemini";
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const {roadmap,milestoneId,status}=await requestJson(request,z.object({roadmap:roadmapSchema,milestoneId:z.string().max(60),status:z.enum(["todo","known","done"])}));
    const updated=updateProgress(roadmap,milestoneId,status);
    const plan=schedule(updated);
    return Response.json({roadmap:updated,remainingHours:plan.remainingHours,weeks:plan.weeks,readyIds:plan.ready.map(m=>m.id)});
  } catch(error) { return errorResponse(error); }
}
