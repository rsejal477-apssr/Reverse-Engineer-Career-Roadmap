import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import ts from "typescript";
import { drizzle } from "drizzle-orm/d1";
const out=path.resolve(".sites-runtime/tests");
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,"package.json"),'{"type":"commonjs"}');
function compile(source,target){
  let code=ts.transpileModule(fs.readFileSync(source,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const [from,to] of Object.entries({"cloudflare:workers":"./env.cjs","@/app/chatgpt-auth":"./auth.cjs","@/db":"./db.cjs","@/db/schema":"./schema.js","@/lib/gemini":"./gemini.js","@/lib/ai-connection":"./ai-connection.js","@/lib/roadmap":"./roadmap.js"}))code=code.replaceAll('require("'+from+'")','require("'+to+'")');
  fs.writeFileSync(path.join(out,target),code);
}
for(const name of ["roadmap","example","gemini","api-client","api-errors","connection-crypto","ai-connection","easecareer-catalog","assignments","learning"]){
  compile("lib/"+name+".ts",name+".js");
}
compile("db/schema.ts","schema.js");
compile("app/api/ai-connection/route.ts","connection-route.js");
compile("app/api/config/route.ts","config-route.js");
compile("app/api/roadmaps/route.ts","roadmaps-route.js");
fs.writeFileSync(path.join(out,"env.cjs"),"exports.env={};");
fs.writeFileSync(path.join(out,"auth.cjs"),"exports.user=null;exports.getChatGPTUser=async()=>exports.user;");
fs.writeFileSync(path.join(out,"db.cjs"),"exports.db=null;exports.getDb=()=>exports.db;");
const require=createRequire(import.meta.url);
const {schedule,validateGraph,updateProgress,updateMilestoneTask,roadmapSchema,inputSchema}=require(path.join(out,"roadmap.js"));
const {exampleRoadmap,exampleAdvice}=require(path.join(out,"example.js"));
const {generateRoadmap,generateAdvice,getApiKey,ApiError}=require(path.join(out,"gemini.js"));
const {env}=require(path.join(out,"env.cjs"));
const {readApi}=require(path.join(out,"api-client.js"));
const {z}=require("zod");
const {encryptConnection,decryptConnection}=require(path.join(out,"connection-crypto.js"));
const connections=require(path.join(out,"ai-connection.js"));
const connectionRoute=require(path.join(out,"connection-route.js"));
const configRoute=require(path.join(out,"config-route.js"));
const roadmapsRoute=require(path.join(out,"roadmaps-route.js"));
const {catalog,getStages,getTopic}=require(path.join(out,"easecareer-catalog.js"));
const {getAssignment,hasCuratedAssignment,assignmentKey,suggestedMilestoneTasks}=require(path.join(out,"assignments.js"));
const {learningSchema,toggleAssignmentTask}=require(path.join(out,"learning.js"));
const auth=require(path.join(out,"auth.cjs")),dbStub=require(path.join(out,"db.cjs"));
const {Miniflare}=createRequire(require.resolve("wrangler/package.json"))("miniflare");
test("API parsing preserves valid data and actionable JSON errors",async()=>{
  const schema=z.object({saved:z.boolean()});
  assert.deepEqual(await readApi(Response.json({saved:true}),schema),{saved:true});
  await assert.rejects(()=>readApi(Response.json({error:"Gemini rejected the key. Check the key and its access."},{status:401}),schema),/Gemini rejected the key/);
  await assert.rejects(()=>readApi(Response.json({saved:"yes"}),schema),/incomplete data/);
});
test("HTML, plain text, empty and truncated responses never expose parser errors",async()=>{
  const schema=z.object({saved:z.boolean()});
  for(const body of ["Internal Server Error","",'{"saved":']) {
    await assert.rejects(()=>readApi(new Response(body,{status:502}),schema),e=>e.message.includes("HTTP 502")&&!e.message.includes("Unexpected token")&&!e.message.includes(body||"SyntaxError"));
  }
  await assert.rejects(()=>readApi(new Response("<html>Sign in</html>",{headers:{"Content-Type":"text/html"}}),schema),/Open EaseCareer in a new tab/);
  await assert.rejects(()=>readApi(new Response("Forbidden",{status:403}),schema),/session could not be verified/);
  await assert.rejects(()=>readApi(new Response('{"saved":'),schema),/incomplete response/);
});
test("redirected API requests explain how to recover the session",async()=>{
  const response=Response.json({saved:true});
  Object.defineProperty(response,"redirected",{value:true});
  await assert.rejects(()=>readApi(response,z.object({saved:z.boolean()})),/sign in/);
});
test("example contract is valid and references exist",()=>{
  assert.equal(roadmapSchema.safeParse(exampleRoadmap).success,true);
  assert.doesNotThrow(()=>validateGraph(exampleRoadmap.milestones));
  assert.equal(inputSchema.safeParse({...exampleRoadmap.input,hoursPerWeek:0}).success,false);
});
test("known skills remove effort and compact the remaining path",()=>{
  const initial=schedule(exampleRoadmap),next=schedule(updateProgress(exampleRoadmap,"react","known"));
  assert.equal(initial.remainingHours-next.remainingHours,36);
  assert.equal(next.done,initial.done+1);
  assert.equal(next.layers.get("react"),-1);
  assert.equal(next.weeks,Math.ceil(next.remainingHours/10));
});
test("a project unlocks only after all prerequisites are covered",()=>{
  let r=updateProgress(exampleRoadmap,"react","done");
  r=updateProgress(r,"api","done");
  assert.equal(schedule(r).ready.some(m=>m.id==="project"),false);
  r=updateProgress(r,"climate","known");
  assert.equal(schedule(r).ready.some(m=>m.id==="project"),true);
  assert.equal(schedule(r).layers.get("project"),0);
});
test("changing weekly effort recalculates the budget",()=>{
  const initial=schedule(exampleRoadmap);
  assert.ok(schedule({...exampleRoadmap,input:{...exampleRoadmap.input,hoursPerWeek:20}}).weeks<initial.weeks);
  assert.equal(schedule({...exampleRoadmap,input:{...exampleRoadmap.input,targetMonths:1}}).fits,false);
});
test("bad dependency graphs are rejected",()=>{
  assert.throws(()=>validateGraph([...exampleRoadmap.milestones,exampleRoadmap.milestones[0]]),/unique/);
  assert.throws(()=>validateGraph(exampleRoadmap.milestones.map(m=>m.id==="web"?{...m,prerequisites:["missing"]}:m)),/exist/);
  assert.throws(()=>validateGraph(exampleRoadmap.milestones.map(m=>m.id==="web"?{...m,prerequisites:["role"]}:m)),/cycle/);
});
test("every catalog topic has an actionable assignment",()=>{
  const ids=[...new Set(catalog.flatMap(item=>getStages(item).flatMap(stage=>stage.topics)))];
  assert.equal(ids.length,115);
  for(const id of ids){
    assert.equal(hasCuratedAssignment(id),true,`Missing curated assignment for ${id}`);
    const assignment=getAssignment(getTopic(id));
    assert.equal(assignment.tasks.length,3,id);
    assert.equal(new Set(assignment.tasks.map(task=>task.id)).size,3,id);
    assert.ok(assignment.deliverable.length>20,id);
    assert.ok(assignment.checks.length>=3,id);
  }
});
test("old browser progress survives task storage migration and stays separate by path",()=>{
  const legacy={favorites:["full-stack"],progress:{"full-stack":{html:"done"}},notes:{"full-stack:html":"My notes"},lessons:{"html-fundamentals":[0]},projects:{"task-tracker":[0]}};
  const migrated=learningSchema.parse(legacy);
  assert.deepEqual(migrated.favorites,legacy.favorites);
  assert.deepEqual(migrated.notes,legacy.notes);
  assert.deepEqual(migrated.projects,legacy.projects);
  assert.deepEqual(migrated.assignments,{});
  const checked=toggleAssignmentTask(migrated,"full-stack","html","step-1");
  assert.equal(checked.progress["full-stack"].html,"learning");
  assert.deepEqual(checked.assignments[assignmentKey("full-stack","html")],["step-1"]);
  assert.equal(checked.assignments[assignmentKey("frontend","html")],undefined);
  const restored=learningSchema.parse(JSON.parse(JSON.stringify(checked)));
  const undone=toggleAssignmentTask(restored,"full-stack","html","step-1");
  assert.deepEqual(undone.assignments[assignmentKey("full-stack","html")],[]);
  assert.equal(undone.notes["full-stack:html"],"My notes");
});
test("legacy AI roadmaps accept task defaults and undoing a completed task restores effort",()=>{
  const legacy={...exampleRoadmap,milestones:exampleRoadmap.milestones.map(({tasks,...milestone})=>milestone)};
  const parsed=roadmapSchema.parse(legacy);
  assert.deepEqual(parsed.milestones.find(m=>m.id==="react").tasks,[]);
  const tasks=suggestedMilestoneTasks(parsed.milestones.find(m=>m.id==="react")).map(task=>({...task,done:false}));
  const checked=updateMilestoneTask(parsed,"react",tasks,tasks[0].id);
  const restored=roadmapSchema.parse(JSON.parse(JSON.stringify(checked)));
  assert.equal(restored.milestones.find(m=>m.id==="react").tasks[0].done,true);
  const completed=updateProgress(restored,"react","done");
  const undone=updateMilestoneTask(completed,"react",completed.milestones.find(m=>m.id==="react").tasks,tasks[0].id);
  assert.equal(undone.milestones.find(m=>m.id==="react").status,"todo");
  assert.equal(schedule(undone).remainingHours-schedule(completed).remainingHours,36);
  const duplicate={...restored,milestones:restored.milestones.map(m=>m.id==="react"?{...m,tasks:[m.tasks[0],m.tasks[0]]}:m)};
  assert.throws(()=>validateGraph(duplicate.milestones),/Task IDs must be unique/);
});
test("AI task generation requests concrete tasks and cannot pre-complete them",async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async(_,options)=>{
      const body=JSON.parse(options.body);
      const schema=body.generationConfig.responseFormat.text.schema.properties.milestones.items;
      assert.ok(schema.required.includes("tasks"));
      assert.equal(schema.properties.tasks.minItems,3);
      const prompt=JSON.stringify(body.contents);
      assert.ok(prompt.includes("exactly three practical tasks"));
      const milestones=exampleRoadmap.milestones.map(m=>({...m,tasks:suggestedMilestoneTasks(m).map(task=>({...task,done:true}))}));
      return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({title:exampleRoadmap.title,summary:exampleRoadmap.summary,milestones})}]}}]});
    };
    const generated=await generateRoadmap(exampleRoadmap.input,"mock-key-1234567890");
    assert.ok(generated.milestones.every(m=>m.tasks.length===3 && m.tasks.every(task=>task.done===false)));
  }finally{globalThis.fetch=original;}
});
test("saved AI task checklists round-trip through the database and remain private",async()=>{
  const runtime=new Miniflare({modules:true,script:"export default { fetch(){ return new Response('task test'); } }",compatibilityDate:"2026-05-15",d1Databases:{DB:"easecareer-task-test"}});
  const request=(method,roadmap)=>new Request("https://easecareer.test/api/roadmaps"+(method==="GET"?"?id="+encodeURIComponent(exampleRoadmap.id):""),{method,headers:{"Content-Type":"application/json",origin:"https://easecareer.test"},...(roadmap?{body:JSON.stringify(roadmap)}:{})});
  try{
    const database=await runtime.getD1Database("DB");
    await database.prepare(fs.readFileSync("drizzle/0000_worried_richard_fisk.sql","utf8")).run();
    dbStub.db=drizzle(database,{schema:require(path.join(out,"schema.js"))});
    const tasks=suggestedMilestoneTasks(exampleRoadmap.milestones.find(m=>m.id==="react")).map(task=>({...task,done:false}));
    const roadmap=updateMilestoneTask(exampleRoadmap,"react",tasks,tasks[0].id);
    auth.user={userId:"task-user-a",displayName:"A"};
    assert.equal((await roadmapsRoute.POST(request("POST",roadmap))).status,200);
    const response=await roadmapsRoute.GET(request("GET"));
    assert.equal(response.status,200);
    const loaded=roadmapSchema.parse((await response.json()).roadmap);
    assert.equal(loaded.milestones.find(m=>m.id==="react").tasks[0].done,true);
    auth.user={userId:"task-user-b",displayName:"B"};
    assert.equal((await roadmapsRoute.GET(request("GET"))).status,404);
    assert.equal((await roadmapsRoute.POST(request("POST",roadmap))).status,403);
    auth.user=null;
    assert.equal((await roadmapsRoute.GET(request("GET"))).status,401);
  }finally{auth.user=null;dbStub.db=null;await runtime.dispose();}
});
test("all completed yields zero effort; undo restores the path",()=>{
  const completed={...exampleRoadmap,milestones:exampleRoadmap.milestones.map(m=>({...m,status:"done"}))};
  assert.equal(schedule(completed).remainingHours,0);
  assert.equal(schedule(completed).weeks,0);
  assert.equal(schedule(updateProgress(completed,"role","todo")).remainingHours,12);
});
test("missing keys fail honestly and shared keys require sign-in",async()=>{
  await assert.rejects(()=>getApiKey(new Request("https://example.test/api/generate")),e=>e instanceof ApiError&&e.code==="AI_NOT_CONNECTED");
  env.GEMINI_API_KEY="mock-server-key-123456";
  await assert.rejects(()=>getApiKey(new Request("https://example.test/api/generate")),e=>e.code==="SIGN_IN_REQUIRED");
  delete env.GEMINI_API_KEY;
  assert.equal(await getApiKey(new Request("https://example.test/api/generate",{headers:{"x-gemini-key":"mock-session-key-123456"}})),"mock-session-key-123456");
});
test("AI requests structured JSON and validates the returned graph",async()=>{
  const original=globalThis.fetch;
  try{
    let body;
    globalThis.fetch=async(url,options)=>{
      assert.ok(String(url).startsWith("https://generativelanguage.googleapis.com/"));
      assert.equal(options.headers["x-goog-api-key"],"mock-key-1234567890");
      body=JSON.parse(options.body);
      return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({title:exampleRoadmap.title,summary:exampleRoadmap.summary,milestones:exampleRoadmap.milestones})}]}}]});
    };
    const result=await generateRoadmap(exampleRoadmap.input,"mock-key-1234567890");
    assert.equal(result.source,"ai");
    assert.equal(body.generationConfig.responseFormat.text.mimeType,"APPLICATION_JSON");
    assert.ok(body.generationConfig.responseFormat.text.schema.properties.milestones);
    assert.equal(JSON.stringify(result).includes("mock-key-1234567890"),false);
    globalThis.fetch=async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({...exampleRoadmap,milestones:exampleRoadmap.milestones.map(m=>m.id==="web"?{...m,prerequisites:["role"]}:m)})}]}}]});
    await assert.rejects(()=>generateRoadmap(exampleRoadmap.input,"mock-key-1234567890"),e=>e.code==="INVALID_AI_GRAPH");
  }finally{globalThis.fetch=original;}
});
test("AI advice has concrete structure and quota errors are actionable",async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify(exampleAdvice)}]}}]});
    const advice=await generateAdvice(exampleRoadmap,exampleRoadmap.milestones[2],"mock-key-1234567890");
    assert.equal(advice.project.title,exampleAdvice.project.title);
    globalThis.fetch=async()=>new Response("quota",{status:429});
    await assert.rejects(()=>generateRoadmap(exampleRoadmap.input,"mock-key-1234567890"),e=>e.code==="AI_RATE_LIMIT"&&e.status===429);
  }finally{globalThis.fetch=original;}
});
test("provider invalid keys, non-JSON and truncated output have safe errors",async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async()=>Response.json({error:{details:[{reason:"API_KEY_INVALID"}]}},{status:400});
    await assert.rejects(()=>generateRoadmap(exampleRoadmap.input,"mock-key-1234567890"),e=>e.code==="AI_KEY_REJECTED");
    globalThis.fetch=async()=>new Response("<html>Bad gateway</html>");
    await assert.rejects(()=>generateRoadmap(exampleRoadmap.input,"mock-key-1234567890"),e=>e.code==="INVALID_AI_RESPONSE");
    globalThis.fetch=async()=>Response.json(null);
    await assert.rejects(()=>generateRoadmap(exampleRoadmap.input,"mock-key-1234567890"),e=>e.code==="INVALID_AI_RESPONSE");
    globalThis.fetch=async()=>Response.json({candidates:[{content:{parts:[{text:'{"title":'}]}}]});
    await assert.rejects(()=>generateRoadmap(exampleRoadmap.input,"mock-key-1234567890"),e=>e.code==="INVALID_AI_RESULT");
  }finally{globalThis.fetch=original;}
});
test("Gemini's REST MIME enum is used for roadmaps and advice",async()=>{
  const original=globalThis.fetch;
  try{
    let calls=0;
    globalThis.fetch=async(_,options)=>{
      const body=JSON.parse(options.body);
      // Reproduce the observed Google REST rejection of a MIME string here.
      if(body.generationConfig.responseFormat.text.mimeType!=="APPLICATION_JSON") {
        return Response.json({error:{code:400,status:"INVALID_ARGUMENT",details:[{"@type":"type.googleapis.com/google.rpc.BadRequest",fieldViolations:[{field:"generation_config.response_format.text.mime_type"}]}]}},{status:400});
      }
      const output=calls++===0?{title:exampleRoadmap.title,summary:exampleRoadmap.summary,milestones:exampleRoadmap.milestones}:exampleAdvice;
      return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(output)}]}}]});
    };
    await generateRoadmap(exampleRoadmap.input,"mock-key-1234567890");
    await generateAdvice(exampleRoadmap,exampleRoadmap.milestones[2],"mock-key-1234567890");
    assert.equal(calls,2);
  }finally{globalThis.fetch=original;}
});
test("request format errors are distinct and diagnostics exclude keys and provider text",async()=>{
  const original=globalThis.fetch,originalWarn=console.warn;
  const logs=[];
  try{
    console.warn=(...args)=>logs.push(args);
    globalThis.fetch=async()=>Response.json({error:{code:400,status:"INVALID_ARGUMENT",message:"Bad request containing mock-key-1234567890",details:[{fieldViolations:[{field:"generation_config.response_format.text.mime_type"}]}]}},{status:400});
    await assert.rejects(()=>generateRoadmap(exampleRoadmap.input,"mock-key-1234567890"),e=>e.code==="AI_REQUEST_INVALID"&&e.message.includes("request format"));
    assert.equal(logs[0][1].providerStatus,400);
    assert.equal(JSON.stringify(logs).includes("mock-key-1234567890"),false);
    assert.equal(JSON.stringify(logs).includes("Bad request"),false);
  }finally{globalThis.fetch=original;console.warn=originalWarn;}
});
test("the AI timeout also aborts a stalled response body",async(t)=>{
  const original=globalThis.fetch;
  t.mock.timers.enable({apis:["setTimeout"]});
  try{
    let signal;
    globalThis.fetch=async(_,options)=>{
      signal=options.signal;
      const response=new Response();
      response.text=()=>new Promise((_,reject)=>signal.addEventListener("abort",()=>reject(new Error("aborted")),{once:true}));
      return response;
    };
    const pending=generateRoadmap(exampleRoadmap.input,"mock-key-1234567890");
    await Promise.resolve();
    const rejected=assert.rejects(pending,e=>e.code==="AI_UNAVAILABLE"&&e.status===504);
    t.mock.timers.tick(45000);
    assert.equal(signal.aborted,true);
    await rejected;
  }finally{globalThis.fetch=original;t.mock.timers.reset();}
});
test("saved connections are encrypted with fresh nonces and bound to their owner",async()=>{
  const secret="ab".repeat(32),key="mock-saved-gemini-key-1234567890";
  const first=await encryptConnection(key,"user-a",secret),second=await encryptConnection(key,"user-a",secret);
  assert.notEqual(first,second);
  assert.equal(first.includes(key),false);
  assert.equal(await decryptConnection(first,"user-a",secret),key);
  await assert.rejects(()=>decryptConnection(first,"user-b",secret));
  await assert.rejects(()=>decryptConnection(first,"user-a","cd".repeat(32)));
  const tampered=first.slice(0,-2)+(first.endsWith("00")?"01":"00");
  await assert.rejects(()=>decryptConnection(tampered,"user-a",secret));
});
test("saved Gemini connections survive refreshes, isolate users and can be removed",async()=>{
  const originalFetch=globalThis.fetch;
  const runtime=new Miniflare({modules:true,script:"export default { fetch(){ return new Response('connection test'); } }",compatibilityDate:"2026-05-15",d1Databases:{DB:"pathforge-connection-test"}});
  const secret="ef".repeat(32),keyA="mock-user-a-gemini-key-123456",keyB="mock-user-b-gemini-key-123456";
  const request=(method,key,origin="https://pathforge.test")=>new Request("https://pathforge.test/api/ai-connection",{method,headers:{"Content-Type":"application/json",origin},...(key?{body:JSON.stringify({key})}:{})});
  try {
    const database=await runtime.getD1Database("DB");
    await database.prepare(fs.readFileSync("drizzle/0001_useful_greymalkin.sql","utf8")).run();
    dbStub.db=drizzle(database,{schema:require(path.join(out,"schema.js"))});
    env.AI_CONNECTION_ENCRYPTION_KEY=secret;
    let providerCalls=0;
    globalThis.fetch=async(url,options)=>{
      providerCalls++;
      assert.equal(String(url),"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite");
      assert.equal(options.body,undefined);
      return Response.json({name:"models/gemini-3.5-flash-lite",supportedGenerationMethods:["generateContent"]});
    };
    auth.user=null;
    assert.equal((await connectionRoute.POST(request("POST",keyA))).status,401);
    assert.equal(providerCalls,0);
    auth.user={userId:"user-a",displayName:"A"};
    assert.equal((await connectionRoute.POST(request("POST",keyA,"https://other.test"))).status,403);
    assert.equal(providerCalls,0);
    const saved=await connectionRoute.POST(request("POST",keyA));
    assert.equal(saved.status,200);
    const savedBody=await saved.json();
    assert.equal(savedBody.connectionSource,"saved");
    assert.equal(JSON.stringify(savedBody).includes(keyA),false);
    const record=await database.prepare("SELECT encrypted_key FROM ai_connections WHERE owner_id = ?").bind("user-a").first();
    assert.equal(record.encrypted_key.includes(keyA),false);
    assert.equal(await decryptConnection(record.encrypted_key,"user-a",secret),keyA);
    // A new request has no key header or browser component state.
    assert.equal(await getApiKey(new Request("https://pathforge.test/api/generate")),keyA);
    const refreshed=await (await configRoute.GET()).json();
    assert.equal(refreshed.aiConfigured,true);
    assert.equal(refreshed.connectionSource,"saved");
    assert.equal(JSON.stringify(refreshed).includes(keyA),false);
    assert.equal(JSON.stringify(refreshed).includes("encrypted_key"),false);
    auth.user={userId:"user-b",displayName:"B"};
    assert.equal((await (await configRoute.GET()).json()).aiConfigured,false);
    await assert.rejects(()=>getApiKey(new Request("https://pathforge.test/api/generate")),e=>e.code==="AI_NOT_CONNECTED");
    assert.equal((await connectionRoute.POST(request("POST",keyB))).status,200);
    globalThis.fetch=async()=>Response.json({error:{details:[{reason:"API_KEY_INVALID"}]}},{status:400});
    const rejected=await connectionRoute.POST(request("POST","invalid-test-key-1234567890"));
    assert.equal(rejected.status,401);
    assert.equal(await connections.readSavedConnection("user-b"),keyB);
    auth.user={userId:"user-a",displayName:"A"};
    assert.equal((await connectionRoute.DELETE(request("DELETE"))).status,200);
    assert.equal(await connections.readSavedConnection("user-a"),null);
    assert.equal(await connections.readSavedConnection("user-b"),keyB);
    assert.equal((await (await configRoute.GET()).json()).aiConfigured,false);
    auth.user=null;
    assert.equal((await connectionRoute.DELETE(request("DELETE"))).status,401);
  } finally {
    globalThis.fetch=originalFetch;auth.user=null;dbStub.db=null;delete env.AI_CONNECTION_ENCRYPTION_KEY;
    await runtime.dispose();
  }
});
