import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { roadmaps } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { roadmapSchema, validateGraph } from "@/lib/roadmap";
import { ApiError, checkOrigin, requestJson, errorResponse } from "@/lib/gemini";
export const dynamic="force-dynamic";
async function owner() {
  const user=await getChatGPTUser();
  if(!user) throw new ApiError("Sign in with ChatGPT to save and load your roadmaps.",401,"SIGN_IN_REQUIRED");
  return user.userId;
}
export async function GET(request:Request) {
  try {
    const ownerId=await owner();
    const id=new URL(request.url).searchParams.get("id");
    if(id){
      const records=await getDb().select().from(roadmaps).where(and(eq(roadmaps.ownerId,ownerId),eq(roadmaps.id,id))).limit(1);
      if(!records.length) throw new ApiError("Roadmap not found.",404);
      return Response.json({roadmap:JSON.parse(records[0].payload)},{headers:{"Cache-Control":"no-store"}});
    }
    const records=await getDb().select({id:roadmaps.id,title:roadmaps.title,updatedAt:roadmaps.updatedAt}).from(roadmaps).where(eq(roadmaps.ownerId,ownerId)).orderBy(desc(roadmaps.updatedAt)).limit(30);
    return Response.json({roadmaps:records},{headers:{"Cache-Control":"no-store"}});
  } catch(error) {return errorResponse(error);}
}
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const ownerId=await owner();
    const roadmap=await requestJson(request,roadmapSchema);
    validateGraph(roadmap.milestones);
    const db=getDb();
    const existing=await db.select({ownerId:roadmaps.ownerId}).from(roadmaps).where(eq(roadmaps.id,roadmap.id)).limit(1);
    if(existing.length && existing[0].ownerId!==ownerId) throw new ApiError("This roadmap cannot be updated.",403);
    await db.insert(roadmaps).values({id:roadmap.id,ownerId,payload:JSON.stringify(roadmap),title:roadmap.title,updatedAt:Date.now()})
      .onConflictDoUpdate({target:roadmaps.id,set:{payload:JSON.stringify(roadmap),title:roadmap.title,updatedAt:Date.now()},setWhere:eq(roadmaps.ownerId,ownerId)});
    return Response.json({saved:true,id:roadmap.id});
  } catch(error) {return errorResponse(error);}
}
