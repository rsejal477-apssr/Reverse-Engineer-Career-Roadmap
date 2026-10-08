"use client";
import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { ReactFlow, ReactFlowProvider, Background, Controls, Handle, Position, type NodeProps, type Node, type Edge, MarkerType, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Compass, Route, FolderOpen, Settings2, ArrowUpRight, ArrowRight, Sparkles, Plus, X, Check, CheckCircle2, Clock3, Target, Code2, Layers3, BriefcaseBusiness, Award, GitBranch, BookOpen, ChevronRight, Download, Save, LoaderCircle, RotateCcw, Zap, CircleHelp, LogIn, Map as MapIcon, List, ExternalLink, Flag } from "lucide-react";
import { z } from "zod";
import { exampleRoadmap, exampleAdvice } from "@/lib/example";
import { readApi } from "@/lib/api-client";
import { schedule, isFinished, updateProgress, updateMilestoneTask, inputSchema, type Roadmap, type Milestone, type Advice, type GoalInput, roadmapSchema, adviceSchema } from "@/lib/roadmap";
import { suggestedMilestoneTasks } from "@/lib/assignments";

type SkillNode = Node<{milestone:Milestone; ready:boolean; active:boolean}, "skill">;
const categoryIcons={skill:Code2,project:Layers3,credential:Award,role:BriefcaseBusiness};
function MilestoneNode({data}:NodeProps<SkillNode>) {
  const m=data.milestone, Icon=categoryIcons[m.category];
  return <div className={"skill-node "+m.category+(data.active?" selected":"")+(isFinished(m)?" finished":"")}>
    <Handle type="target" position={Position.Top}/>
    <div className="node-top"><span className={"node-icon "+m.category}><Icon size={17}/></span><span className={"node-state "+(isFinished(m)?"complete":data.ready?"ready":"")}>{isFinished(m)?<><Check size={12}/>{m.status==="known"?"Known":"Done"}</>:data.ready?"Ready to start":m.category==="role"?"Your destination":m.phase}</span></div>
    <strong>{m.title}</strong><p>{m.deliverable}</p>
    <div className="node-bottom"><span><Clock3 size={12}/>{m.hours} hrs</span><span>{m.category}<ChevronRight size={12}/></span></div>
    <Handle type="source" position={Position.Bottom}/>
  </div>;
}
const nodeTypes={skill:MilestoneNode};
function RoadmapCanvas({roadmap,selected,onSelect,showFinished}:{roadmap:Roadmap;selected:string;onSelect:(id:string)=>void;showFinished:boolean}) {
  const plan=useMemo(()=>schedule(roadmap),[roadmap]);
  const {nodes,edges}=useMemo(()=>{
    const visible=roadmap.milestones.filter(m=>showFinished||!isFinished(m));
    const groups=new Map<number,Milestone[]>();
    visible.forEach(m=>{const level=plan.layers.get(m.id)!;groups.set(level,[...(groups.get(level)??[]),m]);});
    const maxWidth=Math.max(1,...Array.from(groups.values()).map(g=>g.length));
    const width=maxWidth*240;
    const nodes:SkillNode[]=visible.map(m=>{
      const level=plan.layers.get(m.id)!;
      const group=groups.get(level)!;
      const row=level+(showFinished?1:0);
      return {id:m.id,type:"skill",position:{x:(width-group.length*240)/2+group.indexOf(m)*240,y:row*210},
        selected:m.id===selected,data:{milestone:m,active:m.id===selected,ready:plan.ready.some(n=>n.id===m.id)}};
    });
    const ids=new Set(visible.map(m=>m.id));
    const edges:Edge[]=visible.flatMap(m=>m.prerequisites.filter(p=>ids.has(p)).map(p=>({
      id:p+"-"+m.id,source:p,target:m.id,type:"smoothstep",
      style:{stroke:isFinished(roadmap.milestones.find(n=>n.id===p)!)?"#adbfac":"#bec3ce",strokeWidth:1.6},
      markerEnd:{type:MarkerType.ArrowClosed,width:13,height:13,color:"#bec3ce"},
    })));
    return {nodes,edges};
  },[roadmap,selected,showFinished,plan]);
  return <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_,node)=>onSelect(node.id)}
    onNodesChange={changes=>changes.forEach(change=>{if(change.type==="select"&&change.selected)onSelect(change.id);})}
    defaultViewport={{x:25,y:40,zoom:0.85}} minZoom={0.25} maxZoom={1.5}
    panOnScroll={true} zoomOnScroll={false} zoomOnDoubleClick={false} zoomActivationKeyCode={null}
    nodesDraggable={false} nodesConnectable={false} edgesFocusable={false}
    proOptions={{hideAttribution:true}} aria-label="Interactive career roadmap. Scroll or drag to explore. Use the plus and minus buttons to zoom, and arrow keys to move between milestones.">
    <Background color="#d6d9de" gap={20} size={1}/><Controls showInteractive={false}/><CanvasReset changed={roadmap.id}/>
  </ReactFlow>;
}
function CanvasReset({changed}:{changed:string}) {
  const {setViewport}=useReactFlow();
  useEffect(()=>{void setViewport({x:25,y:40,zoom:0.85},{duration:300});},[changed,setViewport]);
  return null;
}
function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const d=ref.current;d?.showModal();return()=>d?.close();},[]);
  return <dialog className="modal" ref={ref} onCancel={onClose} aria-label={title}>
    <div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div>{children}
  </dialog>;
}
const skills=["HTML & CSS","JavaScript","React","Python","SQL","Git","UI/UX"];
type SavedItem={id:string;title:string;updatedAt:number};
const connectionSchema=z.object({aiConfigured:z.boolean(),canSaveKey:z.boolean(),connectionSource:z.enum(["server","saved","none"])});
const configSchema=connectionSchema.extend({signedIn:z.boolean()});
const officialResources=[
  {match:/react/i,title:"React documentation",url:"https://react.dev/learn"},
  {match:/typescript/i,title:"TypeScript handbook",url:"https://www.typescriptlang.org/docs/handbook/intro.html"},
  {match:/javascript|html|css|web/i,title:"MDN Web Docs",url:"https://developer.mozilla.org/en-US/docs/Learn_web_development"},
  {match:/postgres|sql/i,title:"PostgreSQL tutorial",url:"https://www.postgresql.org/docs/current/tutorial.html"},
  {match:/node|api|rest/i,title:"Node.js learning guides",url:"https://nodejs.org/en/learn"},
  {match:/git|contribution|open.source/i,title:"GitHub contribution guide",url:"https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project"},
];

export default function Roadmapper() {
  const [roadmap,setRoadmap]=useState<Roadmap>(exampleRoadmap);
  const [selected,setSelected]=useState("react");
  const [input,setInput]=useState<GoalInput>(exampleRoadmap.input);
  const [skillText,setSkillText]=useState("");
  const [busy,setBusy]=useState(false),[saving,setSaving]=useState(false);
  const [error,setError]=useState(""),[notice,setNotice]=useState("");
  const [modal,setModal]=useState<"ai"|"saved"|"help"|null>(null);
  const [keyDraft,setKeyDraft]=useState("");
  const [connecting,setConnecting]=useState(false),[connectionError,setConnectionError]=useState("");
  const [config,setConfig]=useState<z.infer<typeof configSchema>>({aiConfigured:false,signedIn:false,canSaveKey:false,connectionSource:"none"});
  const [view,setView]=useState<"tree"|"timeline">("tree");
  const [showFinished,setShowFinished]=useState(false);
  const [adviceTab,setAdviceTab]=useState<"overview"|"project"|"interview">("overview");
  const [adviceCache,setAdviceCache]=useState<Record<string,Advice>>({});
  const [adviceLoading,setAdviceLoading]=useState(false),[adviceError,setAdviceError]=useState("");
  const [savedItems,setSavedItems]=useState<SavedItem[]>([]),[savedLoading,setSavedLoading]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [restored,setRestored]=useState(false);
  const generation=useRef(0),adviceGeneration=useRef(0);
  const plan=useMemo(()=>schedule(roadmap),[roadmap]);
  const milestone=roadmap.milestones.find(m=>m.id===selected)??roadmap.milestones[0];
  const milestoneTasks=milestone.tasks.length ? milestone.tasks : suggestedMilestoneTasks(milestone).map(task=>({...task,done:false}));
  const checkedTasks=milestoneTasks.filter(task=>task.done).length;
  const allTasksDone=milestoneTasks.length>0 && checkedTasks===milestoneTasks.length;
  const cacheKey=roadmap.id+":"+milestone.id;
  const advice=adviceCache[cacheKey]??(roadmap.source==="example"&&milestone.id==="react"?exampleAdvice:null);
  const aiAvailable=config.aiConfigured;
  const progress=Math.round(plan.done/roadmap.milestones.length*100);
  const resources=officialResources.filter(r=>r.match.test(milestone.title+" "+milestone.skills.join(" ")));
  useEffect(()=>{
    fetch("/api/config").then(r=>readApi(r,configSchema)).then(setConfig).catch(()=>setNotice("Could not check the connection. You can still explore the example."));
    try {
      const saved=localStorage.getItem("easecareer-ai-roadmap-v1");
      if(saved){const checked=roadmapSchema.safeParse(JSON.parse(saved));if(checked.success){setRoadmap(checked.data);setInput(checked.data.input);setSelected(checked.data.milestones.find(m=>m.status==="todo")?.id??checked.data.milestones[0].id);}}
    } catch {setNotice("Your previous local roadmap could not be restored.");}
    const requestedGoal=new URLSearchParams(window.location.search).get("goal");
    if(requestedGoal)setInput(prev=>({...prev,goal:(requestedGoal.length<10?"Become a "+requestedGoal+" developer":requestedGoal).slice(0,200)}));
    setRestored(true);
  },[]);
  useEffect(()=>{
    if(!restored)return;
    try{localStorage.setItem("easecareer-ai-roadmap-v1",JSON.stringify(roadmap));}
    catch{setNotice("This browser could not save your local roadmap. Use Save roadmap to keep it in your account.");}
  },[roadmap,restored]);
  useEffect(()=>{
    if(!notice)return;
    const t=setTimeout(()=>setNotice(""),6500);return()=>clearTimeout(t);
  },[notice]);
  useEffect(()=>{
    setAdviceError("");setAdviceLoading(false);setAdviceTab("overview");
    if(roadmap.source!=="ai"||adviceCache[cacheKey]||!aiAvailable)return;
    const token=++adviceGeneration.current;
    setAdviceLoading(true);
    fetch("/api/advice",{method:"POST",headers:requestHeaders(),body:JSON.stringify({roadmap,milestoneId:milestone.id})})
      .then(r=>readApi(r,z.object({advice:adviceSchema})))
      .then(data=>{if(token===adviceGeneration.current)setAdviceCache(prev=>({...prev,[cacheKey]:data.advice}));})
      .catch(e=>{if(token===adviceGeneration.current)setAdviceError(e.message);})
      .finally(()=>{if(token===adviceGeneration.current)setAdviceLoading(false);});
    return()=>{adviceGeneration.current++;};
  },[cacheKey,roadmap.source,aiAvailable]);
  function requestHeaders() { return {"Content-Type":"application/json"}; }
  async function generate(connected=config.aiConfigured) {
    const checked=inputSchema.safeParse(input);
    if(!checked.success){setError(checked.error.issues[0].message);return;}
    if(!connected){setModal("ai");return;}
    const token=++generation.current;
    setBusy(true);setError("");setModal(null);
    try {
      const response=await fetch("/api/generate",{method:"POST",headers:requestHeaders(),body:JSON.stringify(checked.data)});
      const data=await readApi(response,z.object({roadmap:roadmapSchema}));
      if(token!==generation.current)return;
      setRoadmap(data.roadmap);setSelected(data.roadmap.milestones.find((m:Milestone)=>m.status==="todo")?.id??data.roadmap.milestones[0].id);
      setDirty(true);setAdviceCache({});setNotice("Your personalised roadmap is ready.");setView("tree");
    } catch(e){setError(e instanceof Error?e.message:"Could not generate your roadmap.");}
    finally{if(token===generation.current)setBusy(false);}
  }
  async function connect() {
    if(config.aiConfigured){await generate();return;}
    setConnecting(true);setConnectionError("");
    try {
      const response=await fetch("/api/ai-connection",{method:"POST",headers:requestHeaders(),body:JSON.stringify({key:keyDraft.trim()})});
      const connection=await readApi(response,connectionSchema);
      setConfig(prev=>({...prev,...connection}));setKeyDraft("");
      setNotice("Gemini connection saved. You won’t need to paste the key when you return.");
      await generate(true);
    } catch(e){setConnectionError(e instanceof Error?e.message:"Could not save your connection.");}
    finally{setConnecting(false);}
  }
  async function disconnect() {
    setConnecting(true);setConnectionError("");
    try {
      const response=await fetch("/api/ai-connection",{method:"DELETE",headers:requestHeaders()});
      const connection=await readApi(response,connectionSchema);
      setConfig(prev=>({...prev,...connection}));setKeyDraft("");setNotice("Your saved Gemini connection was removed.");
    } catch(e){setConnectionError(e instanceof Error?e.message:"Could not remove your connection.");}
    finally{setConnecting(false);}
  }
  async function changeStatus(status:Milestone["status"]) {
    setError("");
    const oldHours=plan.remainingHours;
    const updated=updateProgress(roadmap,milestone.id,status);
    setRoadmap(updated);setDirty(true);
    const next=schedule(updated);
    const difference=oldHours-next.remainingHours;
    setNotice(difference>0?difference+" hours removed. Your next steps and timeline have updated.":"Your learning path and timeline have updated.");
  }
  function changeTask(taskId:string) {
    setRoadmap(previous=>updateMilestoneTask(previous,milestone.id,milestoneTasks,taskId));
    setDirty(true);
  }
  function addSkill(value:string) {
    const clean=value.trim();
    if(clean && clean.length<=60 && input.currentSkills.length<20 && !input.currentSkills.some(s=>s.toLowerCase()===clean.toLowerCase()))
      setInput({...input,currentSkills:[...input.currentSkills,clean]});
    setSkillText("");
  }
  async function save() {
    if(!config.signedIn){setNotice("Sign in to save this roadmap.");window.top?.location.assign("/signin-with-chatgpt?return_to=%2Fai");return;}
    setSaving(true);setError("");
    const value=roadmap.id==="example-climate-tech"?{...roadmap,id:crypto.randomUUID()}:roadmap;
    try{
      const response=await fetch("/api/roadmaps",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(value)});
      await readApi(response,z.object({saved:z.boolean(),id:z.string()}));
      setRoadmap(value);setDirty(false);setNotice("Roadmap and progress saved.");
    }catch(e){setError(e instanceof Error?e.message:"Could not save your roadmap.");}
    finally{setSaving(false);}
  }
  async function showSaved() {
    setModal("saved");setSavedLoading(true);
    try{
      const response=await fetch("/api/roadmaps");const data=await readApi(response,z.object({roadmaps:z.array(z.object({id:z.string(),title:z.string(),updatedAt:z.number()}))}));
      setSavedItems(data.roadmaps);
    }catch(e){setError(e instanceof Error?e.message:"Could not load saved roadmaps.");}
    finally{setSavedLoading(false);}
  }
  async function load(id:string) {
    try{
      const response=await fetch("/api/roadmaps?id="+encodeURIComponent(id));const data=await readApi(response,z.object({roadmap:roadmapSchema}));
      setRoadmap(data.roadmap);setInput(data.roadmap.input);
      setSelected(data.roadmap.milestones.find((m:Milestone)=>m.status==="todo")?.id??data.roadmap.milestones[0].id);
      setDirty(false);setModal(null);setAdviceCache({});
    }catch(e){setError(e instanceof Error?e.message:"Could not open the roadmap.");}
  }
  function exportRoadmap() {
    const blob=new Blob([JSON.stringify(roadmap,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="easecareer-roadmap.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    setNotice("Your roadmap was exported.");
  }
  function applyPace(value:number) {
    setInput({...input,hoursPerWeek:value});
    setRoadmap(prev=>({...prev,input:{...prev.input,hoursPerWeek:value}}));setDirty(true);
  }
  return <div className="app-shell">
    <aside className="sidebar">
      <a href="/" className="brand"><span className="brand-mark"><Compass size={22}/></span><span>EaseCareer<span className="brand-dot">.</span></span></a>
      <div className="workspace-label">AI CAREER PLANNER</div>
      <nav aria-label="Workspace"><a className="nav-item" href="/"><MapIcon size={18}/>Browse roadmaps</a><button className="nav-item active" onClick={()=>setView("tree")}><Route size={18}/>AI roadmap<span className="nav-dot"/></button>
        <button className="nav-item" onClick={showSaved}><FolderOpen size={18}/>Saved roadmaps</button>
      </nav>
      <div className="sidebar-note"><span className="note-icon"><Compass size={23}/></span><h3>A direction. A next step.</h3><p>Big goals get closer when you know what to do next.</p><button onClick={()=>setModal("help")}>How it works<ArrowUpRight size={15}/></button></div>
      <div className="sidebar-bottom"><button className="nav-item" onClick={()=>setModal("ai")}><Settings2 size={18}/>AI connection<span className={"connection-dot "+(aiAvailable?"connected":"")}/></button>
        <div className="user-card"><span className="user-avatar">Y</span><div><strong>Your workspace</strong><span>Build your next chapter</span></div></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>Career roadmap</strong></div>
        <div className="top-actions"><span className="ai-disclosure"><Sparkles size={13}/>AI career planning</span><button className="icon-button" aria-label="Help" onClick={()=>setModal("help")}><CircleHelp size={19}/></button></div>
      </header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow"><span/>SMALL STEPS. BIG POSSIBILITIES.</div><h1>Your next chapter,<br/><span>mapped out.</span></h1><p>Choose where you want to go. Find the steps that get you there.</p></div>
          <div className="heading-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><span className="art-dot dot-one"/><span className="art-dot dot-two"/><span className="art-compass"><Compass size={49} strokeWidth={1.25}/></span><span className="art-label"><Flag size={13}/>A path that's yours</span></div>
        </div>
        <section className="goal-card" aria-labelledby="goal-heading"><div className="goal-title"><span className="goal-icon"><Target size={19}/></span><div><h2 id="goal-heading">Start with your destination</h2><p>The more specific your goal, the more useful your path.</p></div><span className="step-label">01 / PLAN</span></div>
          <form onSubmit={e=>{e.preventDefault();void generate();}}>
            <div className="goal-form"><div className="goal-field"><label htmlFor="goal">I want to become a...</label><input id="goal" value={input.goal} maxLength={200} minLength={10} required onChange={e=>setInput({...input,goal:e.target.value})} placeholder="e.g. UI/UX designer for fintech apps"/></div>
              <div className="pace-field"><label htmlFor="pace">Time each week</label><select id="pace" value={input.hoursPerWeek} onChange={e=>applyPace(Number(e.target.value))}>{[2,5,8,10,12,15,20,30,40].map(h=><option key={h} value={h}>{h} hours / week</option>)}</select></div>
              <div className="duration-field"><label htmlFor="duration">Target timeline</label><select id="duration" value={input.targetMonths} onChange={e=>{const months=Number(e.target.value);setInput({...input,targetMonths:months});setRoadmap(prev=>({...prev,input:{...prev.input,targetMonths:months}}));setDirty(true);}}>{[1,2,3,6,9,12,18,24].map(m=><option key={m} value={m}>{m} months</option>)}</select></div>
              <button className="primary-button generate" disabled={busy}>{busy?<LoaderCircle className="spin" size={16}/>:<Sparkles size={16}/>} {busy?"Mapping your path…":"Generate roadmap"}{!busy&&<ArrowRight size={16}/>}</button>
            </div>
            <div className="skills-row"><label htmlFor="skill-input">Skills I already have</label><div className="skill-chips">{input.currentSkills.map(s=><span className="skill-chip" key={s}>{s}<button type="button" aria-label={"Remove "+s} onClick={()=>setInput({...input,currentSkills:input.currentSkills.filter(v=>v!==s)})}><X size={11}/></button></span>)}
              <div className="add-skill"><input id="skill-input" value={skillText} list="skill-suggestions" maxLength={60} onChange={e=>setSkillText(e.target.value)} placeholder="+ Add a skill" onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addSkill(skillText);}}}/>{skillText&&<button type="button" aria-label="Add skill" onClick={()=>addSkill(skillText)}><Plus size={13}/></button>}<datalist id="skill-suggestions">{skills.map(s=><option value={s} key={s}/>)}</datalist></div>
            </div></div>
          </form>
        </section>
        {error&&<div className="error-banner" role="alert"><span>{error}</span><button className="icon-button" onClick={()=>setError("")} aria-label="Dismiss error"><X size={16}/></button></div>}
        <div className="roadmap-heading"><div><div className="section-eyebrow">YOUR CAREER ROADMAP</div><h2>{roadmap.title}<span className={"source-badge "+roadmap.source}>{roadmap.source==="ai"?<><Sparkles size={11}/>AI personalised</>:"Example roadmap"}</span></h2><p>{roadmap.input.goal}</p></div>
          <div className="roadmap-actions"><button className="secondary-button" onClick={exportRoadmap}><Download size={15}/><span>Export</span></button><button className="secondary-button" disabled={saving} onClick={save}>{saving?<LoaderCircle className="spin" size={15}/>:<Save size={15}/>}<span>{saving?"Saving…":dirty?"Save changes":"Save roadmap"}</span></button></div>
        </div>
        {roadmap.source==="example"&&<div className="example-note"><BookOpen size={15}/><span>Explore this example, or generate a personalised path for your own goal.</span>{!aiAvailable&&<button onClick={()=>setModal("ai")}>Connect AI<ArrowUpRight size={13}/></button>}</div>}
        <div className="stats-row"><div className="stat"><span className="stat-icon mint"><CheckCircle2 size={19}/></span><div><strong>{plan.done}<span> / {roadmap.milestones.length}</span></strong><small>Milestones covered</small></div></div>
          <div className="stat"><span className="stat-icon lavender"><Clock3 size={19}/></span><div><strong>{plan.weeks}<span> weeks</span></strong><small>Estimated remaining effort</small></div></div>
          <div className="stat"><span className="stat-icon peach"><Zap size={19}/></span><div><strong>{plan.remainingHours}<span> hours</span></strong><small>At {roadmap.input.hoursPerWeek} hours per week</small></div></div>
          <div className="stat progress-stat"><div className="progress-heading"><span>Your progress</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{width:progress+"%"}}/></div><small>{plan.fits?"Your learning effort fits the target timeline.":"Your estimated effort exceeds the target. Increase your weekly time."}</small></div>
        </div>
        <div className="roadmap-workspace">
          <section className="canvas-card" aria-label="Your learning path"><div className="canvas-toolbar"><div className="view-tabs"><button className={view==="tree"?"active":""} onClick={()=>setView("tree")}><GitBranch size={14}/>Skill tree</button><button className={view==="timeline"?"active":""} onClick={()=>setView("timeline")}><List size={14}/>Milestones</button></div><label className="show-known"><input type="checkbox" checked={showFinished} onChange={e=>setShowFinished(e.target.checked)}/>Show covered skills</label></div>
            <div className="canvas-content">{plan.remainingHours===0&&!showFinished&&<div className="canvas-empty"><CheckCircle2 size={34}/><h3>Every milestone covered.</h3><p>Save your progress, or show covered skills to revisit your path.</p></div>}{view==="tree"?<ReactFlowProvider><RoadmapCanvas roadmap={roadmap} selected={selected} onSelect={setSelected} showFinished={showFinished}/></ReactFlowProvider>:<div className="timeline">{roadmap.milestones.filter(m=>showFinished||!isFinished(m)).map((m,i)=><button key={m.id} onClick={()=>setSelected(m.id)} className={"timeline-item "+(m.id===selected?"selected":"")}><span className="timeline-number">{isFinished(m)?<Check size={15}/>:String(i+1).padStart(2,"0")}</span><span><small>{m.phase}</small><strong>{m.title}</strong><p>{m.deliverable}</p></span><span className="timeline-hours">{m.hours}h<ChevronRight size={15}/></span></button>)}</div>}</div>
            <div className="canvas-footer"><div className="legend"><span><i className="legend-dot ready"/>Ready to start</span><span><i className="legend-dot project"/>Project</span><span><i className="legend-dot role"/>Career step</span></div><span className="canvas-hint">Scroll to explore · + / − to zoom</span></div>
          </section>
          <aside className="detail-card" aria-label="Selected milestone details"><div className="detail-topline"><span className="section-eyebrow">YOUR NEXT MOVE</span><span className={"detail-category "+milestone.category}>{milestone.category}</span></div>
            <span className={"detail-icon "+milestone.category}>{(()=>{const Icon=categoryIcons[milestone.category];return <Icon size={25}/>;})()}</span>
            <h3>{milestone.title}</h3><div className="detail-meta"><span><Clock3 size={13}/>{milestone.hours} hours</span><span><Layers3 size={13}/>{milestone.phase}</span></div>
            <div className="detail-tabs"><button className={adviceTab==="overview"?"active":""} onClick={()=>setAdviceTab("overview")}>Overview</button><button className={adviceTab==="project"?"active":""} onClick={()=>setAdviceTab("project")}>Project</button><button className={adviceTab==="interview"?"active":""} onClick={()=>setAdviceTab("interview")}>Interview</button></div>
            {adviceLoading&&<div className="advice-loading" role="status"><LoaderCircle className="spin" size={14}/>Generating specific advice…</div>}
            {adviceError&&<p className="inline-error" role="alert">{adviceError}</p>}
            <div className="detail-body">
              {adviceTab==="overview"&&<><p>{milestone.summary}</p><div className="deliverable"><Flag size={15}/><div><strong>What you'll walk away with</strong><p>{milestone.deliverable}</p></div></div><section className="milestone-assignment" aria-label="Milestone task assignment"><h4>Your milestone tasks</h4><fieldset className="ec-task-checklist"><legend>Practice checklist<span>{checkedTasks} / {milestoneTasks.length}</span></legend>{milestoneTasks.map((task,index)=><label key={task.id} className={task.done?"ec-task-checked":""}><input type="checkbox" checked={task.done} disabled={busy} onChange={()=>changeTask(task.id)}/><span><strong><small>{String(index+1).padStart(2,"0")}</small>{task.title}</strong><span>{task.description}</span></span></label>)}</fieldset><p className="assignment-save-note">Check tasks after doing the work. Progress saves in this browser; use Save roadmap to keep it with your account.</p></section>{advice&&<><h4>Make your first move</h4><ol>{advice.learningSteps.map(s=><li key={s}>{s}</li>)}</ol></>}{resources.length>0&&<><h4>Official reading</h4>{resources.slice(0,2).map(r=><a className="resource-link" href={r.url} target="_blank" rel="noopener noreferrer" key={r.url}>{r.title}<ArrowUpRight size={13}/></a>)}</>}</>}
              {adviceTab==="project"&&(advice?<><span className="mini-label">{roadmap.source==="example"?"EXAMPLE WEEKEND PROJECT":"YOUR WEEKEND PROJECT"}</span><h4 className="project-title">{advice.project.title}</h4><p>{advice.project.brief}</p><ol>{advice.project.steps.map(s=><li key={s}>{s}</li>)}</ol><div className="deliverable"><Flag size={15}/><p>{advice.project.deliverable}</p></div></>:<><p>{milestone.deliverable}</p><p className="muted">Generate a personalised roadmap to get an AI-created weekend project for this milestone.</p><button className="secondary-button" disabled={busy} onClick={()=>generate()}><Sparkles size={14}/>Personalise my path</button></>)}
              {adviceTab==="interview"&&(advice?<><h4>Practise explaining your thinking</h4><ol>{advice.interviewQuestions.map(q=><li key={q}>{q}</li>)}</ol></>:<><p className="muted">Your AI-generated roadmap includes focused interview questions for each milestone.</p><button className="secondary-button" disabled={busy} onClick={()=>generate()}><Sparkles size={14}/>Personalise my path</button></>)}
            </div>
            <div className="detail-bottom">{isFinished(milestone)?<button className="secondary-button full" onClick={()=>changeStatus("todo")}><RotateCcw size={14}/>Add back to my learning path</button>:<><button className="primary-button full" disabled={!allTasksDone || busy} onClick={()=>changeStatus("done")}><Check size={16}/>{allTasksDone ? "Complete milestone" : "Finish tasks to complete"}</button><button className="known-button" onClick={()=>changeStatus("known")}>I already know this<ArrowRight size={13}/></button></>}<p>Covered skills unlock the next steps automatically.</p></div>
          </aside>
        </div>
        <footer className="page-footer"><span><Compass size={14}/>A little clarity goes a long way.</span><span>Learning estimates adapt to your pace.</span></footer>
      </div>
    </main>
    {notice&&<div className="toast" role="status"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss notification"><X size={14}/></button></div>}
    {modal==="ai"&&<Modal title="Your AI connection" onClose={()=>{setModal(null);setKeyDraft("");setConnectionError("");}}>
      <div className="modal-icon"><Sparkles size={25}/></div><p>Connect Gemini once to generate personalised roadmaps, milestone projects and interview questions. Your saved connection is remembered when you return.</p>
      {config.aiConfigured?<div className="connected-message"><CheckCircle2 size={18}/>{config.connectionSource==="saved"?"Your saved Gemini connection is ready.":"Gemini is already connected for this app."}</div>:config.signedIn&&config.canSaveKey?<><label className="field-label" htmlFor="api-key">Gemini API key</label><input className="modal-input" id="api-key" type="password" autoComplete="off" value={keyDraft} onChange={e=>setKeyDraft(e.target.value)} placeholder="Paste your key once" disabled={connecting}/>
        <p className="privacy-note">Your key is encrypted on the server and linked to your signed-in account. It works across refreshes and devices and is never included in your roadmap or exports.</p>
        <a className="resource-link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Get a key in Google AI Studio<ExternalLink size={13}/></a></>:config.signedIn?<p>Connection saving is temporarily unavailable. Please reload and try again.</p>:<p>Sign in with ChatGPT to save your connection and reuse it next time.</p>}
      {connectionError&&<p role="alert">{connectionError}</p>}
      {config.signedIn?<button className="primary-button full" disabled={connecting||busy||(!config.aiConfigured&&(!config.canSaveKey||keyDraft.trim().length<16))} onClick={()=>void connect()}>{connecting?<LoaderCircle className="spin" size={16}/>:<Sparkles size={16}/>} {connecting?"Checking connection…":config.aiConfigured?"Generate my roadmap":"Save connection & generate"}</button>:<a className="primary-button full" href="/signin-with-chatgpt?return_to=%2Fai" target="_top"><LogIn size={16}/>Sign in to save connection</a>}
      {config.connectionSource==="saved"&&<button className="known-button" disabled={connecting||busy} onClick={()=>void disconnect()}>Remove saved connection</button>}
      <button className="known-button" onClick={()=>{setModal(null);setKeyDraft("");}}>Keep exploring the example</button>
    </Modal>}
    {modal==="saved"&&<Modal title="Your saved roadmaps" onClose={()=>setModal(null)}>{savedLoading?<p className="advice-loading"><LoaderCircle className="spin" size={18}/>Loading your roadmaps…</p>:savedItems.length?<div className="saved-list">{savedItems.map(item=><button className="saved-item" key={item.id} onClick={()=>load(item.id)}><span className="saved-icon"><MapIcon size={20}/></span><span><strong>{item.title}</strong><small>Updated {new Date(item.updatedAt).toLocaleDateString()}</small></span><ChevronRight size={17}/></button>)}</div>:<div className="empty-state"><FolderOpen size={34}/><h3>Your next chapter starts here.</h3><p>Save a roadmap to keep your milestones and progress together.</p>{!config.signedIn&&<a className="primary-button" href="/signin-with-chatgpt?return_to=%2Fai" target="_top"><LogIn size={16}/>Sign in to save</a>}</div>}</Modal>}
    {modal==="help"&&<Modal title="A goal becomes a path" onClose={()=>setModal(null)}><div className="help-steps"><div><span>01</span><h3>Get specific</h3><p>Tell us the role, industry or kind of company you want to work in, plus your existing skills and available time.</p></div><div><span>02</span><h3>Explore the stepping stones</h3><p>Your AI roadmap connects skills, concrete projects and career steps. Click any milestone to see what to build and practise.</p></div><div><span>03</span><h3>Make it your own</h3><p>Mark skills as known or completed. Your next steps and effort estimate update immediately. Save your progress to return later.</p></div></div><p className="privacy-note">Personalised roadmaps and milestone advice are generated by AI. The initial example is clearly labeled and is not an AI response to your input.</p></Modal>}
  </div>;
}
