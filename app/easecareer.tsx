"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { z } from "zod";
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Bookmark, Check, CheckCircle2, ChevronDown, ChevronRight, Circle, Clock3, Cloud, Code2, Compass, Cpu, ExternalLink, GitBranch, GraduationCap, Layers, ListChecks, ListFilter, Map, Menu, Minus, Palette, Plus, Rocket, Search, Share2, ShieldCheck, Sparkles, Target, X } from "lucide-react";
import { catalog, getStages, getTopic, guides, packs, projects, type CatalogItem, type Guide, type LessonPack, type ProjectIdea, type Topic } from "@/lib/easecareer-catalog";
import { assignmentKey, getAssignment } from "@/lib/assignments";
import { emptyLearning, learningSchema, toggleAssignmentTask, type Learning, type Status } from "@/lib/learning";
const storageKey = "easecareer-learning-v1";

function useLearning() {
  const [learning, setLearning] = useState<Learning>(emptyLearning);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {const parsed = learningSchema.safeParse(JSON.parse(raw)); if (parsed.success) setLearning(parsed.data);}
    } catch {setStorageError("This browser could not restore your learning progress.");}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {localStorage.setItem(storageKey, JSON.stringify(learning));} catch {setStorageError("This browser cannot save progress. Enable browser storage to keep your changes.");}
  }, [learning, ready]);
  function toggleFavorite(slug: string) {setLearning(prev => ({...prev, favorites: prev.favorites.includes(slug) ? prev.favorites.filter(s => s !== slug) : [...prev.favorites, slug]}));}
  function updateStatus(slug: string, id: string, status?: Status) {
    setLearning(prev => {const next = {...prev.progress[slug]}; if (status) next[id] = status; else delete next[id]; return {...prev, progress: {...prev.progress, [slug]: next}};});
  }
  function updateNote(key: string, value: string) {setLearning(prev => ({...prev, notes: {...prev.notes, [key]: value}}));}
  function toggleStep(type: "lessons" | "projects", id: string, index: number) {
    setLearning(prev => {const list = prev[type][id] ?? []; return {...prev, [type]: {...prev[type], [id]: list.includes(index) ? list.filter(n => n !== index) : [...list, index]}};});
  }
  function toggleTask(slug: string, topicId: string, taskId: string) {setLearning(prev => toggleAssignmentTask(prev, slug, topicId, taskId));}
  function updateEvidence(key: string, value: string) {setLearning(prev => ({...prev, evidence: {...prev.evidence, [key]: value}}));}
  return {learning, ready, storageError, clearStorageError: () => setStorageError(""), toggleFavorite, updateStatus, updateNote, toggleStep, toggleTask, updateEvidence};
}
type LearningStore = ReturnType<typeof useLearning>;

function Modal({title, children, onClose, className = ""}: {title: string; children: ReactNode; onClose: () => void; className?: string}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {const d = ref.current; d?.showModal(); return () => d?.close();}, []);
  return <dialog ref={ref} className={`ec-dialog ${className}`} aria-label={title} onCancel={onClose} onClick={e => {if (e.target === e.currentTarget) onClose();}}>
    <div className="ec-dialog-head"><h2>{title}</h2><button className="ec-icon" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div>{children}
  </dialog>;
}

function SearchBox({query, setQuery}: {query: string; setQuery: (value: string) => void}) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => catalog.filter(c => (c.title + " " + c.group).toLowerCase().includes(query.trim().toLowerCase())), [query]);
  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {e.preventDefault(); ref.current?.focus();}
      if (e.key === "Escape") {setFocused(false); ref.current?.blur();}
    }
    window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown);
  }, []);
  return <div className="ec-search-area"><div className="ec-searchbox"><Search size={19}/><input ref={ref} type="search" aria-label="Search roadmaps" placeholder="What do you want to learn today?" value={query} onChange={e => {setQuery(e.target.value); setFocused(true);}} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 180)} onKeyDown={e => {if (e.key === "Enter" && query.trim() && results[0]) window.location.assign("/" + results[0].slug);}}/>{query ? <button className="ec-search-clear" onClick={() => {setQuery(""); ref.current?.focus();}} aria-label="Clear search"><X size={15}/></button> : <kbd>⌘ K</kbd>}</div>
    {focused && query.trim() && <div className="ec-search-results" aria-label="Search results">{results.length ? results.slice(0, 7).map(c => <a key={c.slug} href={"/" + c.slug}><span><Map size={16}/>{c.title}</span><small>{c.group === "role" ? "Career roadmap" : c.group === "practice" ? "Best practices" : "Skill roadmap"}<ArrowUpRight size={13}/></small></a>) : <div className="ec-search-empty">No roadmaps found. <a href="/ai">Create a personalized path with AI <ArrowRight size={14}/></a></div>}</div>}
  </div>;
}

export function Header({light = false, children}: {light?: boolean; children?: ReactNode}) {
  const [menu, setMenu] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {fetch("/api/config").then(async r => {if (!r.ok) return; const parsed = z.object({signedIn: z.boolean()}).safeParse(await r.json()); if (parsed.success) setSignedIn(parsed.data.signedIn);}).catch(() => {});}, []);
  return <header className={"ec-header" + (light ? " ec-detail-header" : "")}><div className="ec-container"><div className="ec-navigation">
    <a href="/" className="ec-brand" aria-label="EaseCareer home"><span className="ec-logomark"><Compass size={24} strokeWidth={1.8}/></span><span>EaseCareer<span className="ec-brand-dot">.</span></span></a>
    <nav className={"ec-navlinks" + (menu ? " ec-nav-open" : "")} aria-label="Main navigation"><a href="/">Explore</a><a href="/packs">Lessons</a><a href="/projects">Projects</a><a href="/guides">Guides</a><a href="/my-learning" className="ec-learning-nav">My learning</a></nav>
    <div className="ec-account">{signedIn ? <a className="ec-login" href="/my-learning"><Bookmark size={15}/>My progress</a> : <a href="/signin-with-chatgpt?return_to=%2Fmy-learning" className="ec-login">Sign in</a>}<a href="/ai" className="ec-signup"><Sparkles size={14}/>AI Planner</a></div>
    <button className="ec-menu" aria-label={menu ? "Close navigation" : "Open navigation"} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={21}/> : <Menu size={21}/>}</button>
  </div>{children}</div></header>;
}

function RoadmapCard({item, store}: {item: CatalogItem; store: LearningStore}) {
  const saved = store.learning.favorites.includes(item.slug);
  const completed = Object.values(store.learning.progress[item.slug] ?? {}).filter(s => s === "done").length;
  const stages = getStages(item), count = stages.flatMap(s => s.topics).length;
  const icon = item.group === "practice" ? {Icon: ShieldCheck, tone: "rose"} : /ai|inference|prompt|claude|agent/i.test(item.slug) ? {Icon: Cpu, tone: "violet"} : /data|sql|python|machine|analyst|power-bi/i.test(item.slug) ? {Icon: BarChart3, tone: "blue"} : /design|frontend|html|css|react|vue|angular/i.test(item.slug) ? {Icon: Palette, tone: "peach"} : /devops|cloud|docker|aws|linux|kubernetes/i.test(item.slug) ? {Icon: Cloud, tone: "sand"} : {Icon: item.group === "role" ? Compass : Code2, tone: "sage"};
  const descriptions: Record<string, string> = {frontend: "Create thoughtful interfaces that people love to use.", backend: "Build the services and systems behind great products.", "full-stack": "Bring the interface, data, and services together.", "ai-engineer": "Turn intelligent models into useful applications.", "data-analyst": "Find the story in data and make better decisions.", react: "Bring interactive ideas to life, one component at a time.", python: "Build a strong foundation in a versatile language.", devops: "Ship reliable software with a dependable workflow."};
  return <div className={"ec-roadmap-card ec-tone-" + icon.tone}><a href={"/" + item.slug}><span className="ec-path-icon"><icon.Icon size={24} strokeWidth={1.7}/></span><span className="ec-path-label">{item.group === "role" ? "CAREER PATH" : item.group === "skill" ? "SKILL PATH" : "BEST PRACTICE"}{item.isNew && <small className="ec-new">New</small>}</span><h3>{item.title}</h3><p>{descriptions[item.slug] ?? `A practical path to understanding ${item.title.toLowerCase()} and putting it to work.`}</p><div className="ec-path-meta"><span><Layers size={13}/>{stages.length} stages</span><span>{count} topics</span><ArrowUpRight size={17}/></div>{completed > 0 && <small className="ec-card-progress"><CheckCircle2 size={12}/>{completed} topics complete</small>}</a><button className={"ec-bookmark" + (saved ? " is-saved" : "")} aria-label={(saved ? "Remove " : "Add ") + item.title + (saved ? " from favorites" : " to favorites")} aria-pressed={saved} onClick={() => store.toggleFavorite(item.slug)}><Bookmark size={16} fill={saved ? "currentColor" : "none"}/></button></div>;
}

function PackGrid({store, open}: {store: LearningStore; open: (p: LessonPack) => void}) {
  return <div className="ec-pack-grid">{packs.map((p, i) => {const done = store.learning.lessons[p.id]?.length ?? 0; return <button key={p.id} className={"ec-pack-card" + (i === 0 ? " ec-pack-featured" : "")} onClick={() => open(p)}><div className="ec-pack-art" style={{"--pack-color": p.color} as React.CSSProperties}><span>{p.topic === "git" ? <GitBranch size={44}/> : p.topic === "html" || p.topic === "javascript" ? <Code2 size={44}/> : p.topic === "css" ? <Layers size={44}/> : p.topic === "node" ? <Target size={44}/> : <Map size={44}/>}</span><div className="ec-art-lines" aria-hidden="true"><i/><i/><i/></div></div><div className="ec-pack-copy">{i === 0 && <span className="ec-pill-new">NEW PACK</span>}<h3>{p.title}</h3><p>{p.subtitle}</p><div className="ec-pack-meta"><span><BookOpen size={13}/>{p.lessons.length} lessons</span>{done > 0 ? <span>{done}/{p.lessons.length} complete</span> : <span>Hands-on practice</span>}</div><span className="ec-pack-cta">{done ? "Continue learning" : "Explore pack"}<ArrowRight size={15}/></span></div></button>;})}</div>;
}

function ProjectGrid({store, open, category, setCategory}: {store: LearningStore; open: (p: ProjectIdea) => void; category: string; setCategory: (s: string) => void}) {
  const categories = ["All", "Frontend", "Backend", "Full Stack", "Data", "AI", "DevOps"];
  return <><div className="ec-project-filters" aria-label="Project categories">{categories.map(c => <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="ec-project-grid">{projects.filter(p => category === "All" || p.category === category).map(p => <button className="ec-project-card" key={p.id} onClick={() => open(p)}><div className="ec-project-top"><Code2 size={22}/><span className={"ec-difficulty ec-" + p.difficulty.toLowerCase()}>{p.difficulty}</span></div><h3>{p.title}</h3><p>{p.description}</p><div className="ec-project-footer"><span>{p.category}</span><span>{(store.learning.projects[p.id]?.length ?? 0) > 0 ? `${store.learning.projects[p.id].length}/${p.tasks.length} steps` : "View project"}<ArrowUpRight size={14}/></span></div></button>)}</div></>;
}

function GuideList({all = false}: {all?: boolean}) {
  return <section className="ec-guides-section"><div className="ec-section-label"><h2>{all ? "Learning guides" : "A little help along the way"}</h2>{!all && <a href="/guides">All guides <ArrowRight size={14}/></a>}</div><div className="ec-guide-list">{(all ? guides : guides.slice(0, 4)).map(g => <a href={"/guides/" + g.id} key={g.id}><span className="ec-guide-category"><BookOpen size={13}/>{g.category}</span><h3>{g.title}</h3><span className="ec-guide-type">Read the guide<ArrowUpRight size={16}/></span></a>)}</div></section>;
}

function Footer() {
  return <footer className="ec-footer"><div className="ec-container"><div className="ec-footer-body"><div><a href="/" className="ec-footer-brand"><Compass size={23}/>EaseCareer<span>.</span></a><p>Make room for your next chapter.<br/>A little direction. A little practice. A little progress, every day.</p></div><div className="ec-footer-links"><span>LEARN</span><a href="/">Explore paths</a><a href="/packs">Lesson packs</a><a href="/guides">Learning guides</a></div><div className="ec-footer-links"><span>BUILD & GROW</span><a href="/projects">Practice projects</a><a href="/my-learning">My learning</a><a href="/ai">AI career planner</a></div><div className="ec-footer-note"><span className="ec-footer-compass"><Compass size={30} strokeWidth={1.4}/></span><p>You bring the ambition.<br/>We help with the direction.</p></div></div><div className="ec-footer-bottom"><small>© {new Date().getFullYear()} EaseCareer</small><span>Built for curious minds and fresh starts.</span><a href="#top">Back to top <ArrowUpRight size={12}/></a></div></div></footer>;
}

function HomePage({store, tab, changeTab, query, setQuery, packOpen, projectOpen, category, setCategory}: {store: LearningStore; tab: "roadmaps" | "packs" | "projects"; changeTab: (t: "roadmaps" | "packs" | "projects") => void; query: string; setQuery: (s: string) => void; packOpen: (p: LessonPack) => void; projectOpen: (p: ProjectIdea) => void; category: string; setCategory: (s: string) => void}) {
  const [group, setGroup] = useState<"all" | CatalogItem["group"] | "saved">("all");
  const [limit, setLimit] = useState(12);
  const filtered = catalog.filter(c => (group === "all" || (group === "saved" ? store.learning.favorites.includes(c.slug) : c.group === group)) && c.title.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => {setLimit(12);}, [query, group]);
  const filters = [{id: "all" as const, label: "All learning paths", Icon: Compass, count: catalog.length}, {id: "role" as const, label: "Career paths", Icon: Target, count: catalog.filter(c => c.group === "role").length}, {id: "skill" as const, label: "Skills & technologies", Icon: Code2, count: catalog.filter(c => c.group === "skill").length}, {id: "practice" as const, label: "Best practices", Icon: ShieldCheck, count: catalog.filter(c => c.group === "practice").length}, {id: "saved" as const, label: "Saved for later", Icon: Bookmark, count: store.learning.favorites.length}];
  return <><Header/><main><section className="ec-hero ec-container"><div className="ec-hero-copy"><span className="ec-hero-eyebrow"><span/>A LITTLE DIRECTION GOES A LONG WAY</span><h1>Your next chapter<br/>starts with <span>a path.</span></h1><p>Big ambitions, manageable steps. Find the skills to learn, the projects to build, and a direction that feels right for you.</p><div className="ec-hero-actions"><a href="#learning-library" className="ec-primary-button">Explore learning paths<ArrowRight size={17}/></a><a href="/ai" className="ec-hero-secondary"><Sparkles size={16}/>Make it personal</a></div><div className="ec-hero-footnote"><span className="ec-hero-mini-icons"><Code2 size={14}/><BookOpen size={14}/><Rocket size={14}/></span><span>{catalog.length} paths. Practical lessons. Real projects.</span></div></div><div className="ec-journey-art"><span className="ec-art-chip"><Compass size={14}/>A direction, made for you</span><div className="ec-journey-board"><div className="ec-board-heading"><span className="ec-board-icon"><Code2 size={23}/></span><div><span>YOUR NEXT CHAPTER</span><h2>Full-stack developer</h2></div><a href="/full-stack" aria-label="Explore the full-stack path"><ArrowUpRight size={18}/></a></div><div className="ec-board-divider"/><div className="ec-board-step"><span className="ec-step-marker">01</span><div><strong>Start with the essentials</strong><span>HTML · CSS · JavaScript</span></div><BookOpen size={17}/></div><div className="ec-board-step"><span className="ec-step-marker">02</span><div><strong>Connect your skills</strong><span>React · APIs · Databases</span></div><Layers size={17}/></div><div className="ec-board-step"><span className="ec-step-marker">03</span><div><strong>Build something real</strong><span>Your first complete application</span></div><Rocket size={17}/></div><a href="/full-stack" className="ec-board-footer">One step at a time.<ArrowRight size={15}/></a></div><span className="ec-art-note"><span><Sparkles size={18}/></span><div>Small steps.<strong>More possibilities.</strong></div></span><div className="ec-art-orbit" aria-hidden="true"/><div className="ec-art-dot" aria-hidden="true"/></div></section>
    <section className="ec-starting-points ec-container" aria-label="Popular starting points"><span className="ec-starting-label">FIND YOUR STARTING POINT</span><a href="/full-stack"><span className="ec-quick-icon ec-tone-sage"><Code2 size={20}/></span><span><strong>Build complete products</strong><small>Full-stack development</small></span><ArrowUpRight size={17}/></a><a href="/ai-engineer"><span className="ec-quick-icon ec-tone-violet"><Cpu size={20}/></span><span><strong>Explore the world of AI</strong><small>AI engineering</small></span><ArrowUpRight size={17}/></a><a href="/data-analyst"><span className="ec-quick-icon ec-tone-blue"><BarChart3 size={20}/></span><span><strong>Make sense of data</strong><small>Data analysis</small></span><ArrowUpRight size={17}/></a></section>
    <section className="ec-library ec-container" id="learning-library"><div className="ec-library-heading"><div><span className="ec-page-eyebrow">A SPACE FOR YOUR AMBITION</span><h2>The learning library</h2><p>Find something you want to get good at.</p></div><div className="ec-tabs" role="tablist" aria-label="Browse learning resources">{(["roadmaps", "packs", "projects"] as const).map(t => {const Icon = t === "roadmaps" ? Map : t === "packs" ? BookOpen : Code2; return <button key={t} id={"ec-tab-" + t} role="tab" aria-selected={tab === t} aria-controls="ec-browse-panel" className={tab === t ? "active" : ""} onClick={() => changeTab(t)}><Icon size={15}/>{t === "roadmaps" ? "Paths" : t === "packs" ? "Lessons" : "Projects"}</button>;})}</div></div><div className="ec-library-layout"><aside className="ec-library-sidebar"><span className="ec-filter-label">EXPLORE BY</span><nav aria-label="Learning path categories">{filters.map(f => <button key={f.id} className={group === f.id && tab === "roadmaps" ? "active" : ""} onClick={() => {setGroup(f.id); changeTab("roadmaps");}}><f.Icon size={17}/><span>{f.label}</span><small>{f.count}</small></button>)}</nav><div className="ec-popular-topics"><span className="ec-filter-label">POPULAR TOPICS</span>{["React", "Python", "JavaScript", "System Design"].map(t => <button key={t} onClick={() => {setGroup("all"); changeTab("roadmaps"); setQuery(t);}}>{t}<ArrowUpRight size={12}/></button>)}</div><div className="ec-sidebar-coach"><Sparkles size={23}/><h3>A path that fits you.</h3><p>Your goals, your skills,<br/>your pace. Let’s make a plan.</p><a href="/ai">Meet your AI planner<ArrowRight size={14}/></a></div></aside><div className="ec-library-content" id="ec-browse-panel" role="tabpanel" aria-labelledby={"ec-tab-" + tab}>{tab === "roadmaps" ? <><div className="ec-catalog-toolbar"><span>{filtered.length} {group === "saved" ? "saved paths" : "learning paths"}</span><SearchBox query={query} setQuery={setQuery}/></div>{filtered.length ? <><div className="ec-roadmap-grid">{filtered.slice(0, limit).map(c => <RoadmapCard item={c} key={c.slug} store={store}/>)}</div>{limit < filtered.length && <div className="ec-load-more"><button className="ec-outline-button" onClick={() => setLimit(v => v + 12)}>Discover more paths<Plus size={15}/></button><span>Showing {Math.min(limit, filtered.length)} of {filtered.length}</span></div>}</> : <div className="ec-empty-state"><Compass size={32}/><h3>{group === "saved" && !query ? "Keep a little inspiration for later." : "Let’s find another direction."}</h3><p>{group === "saved" && !query ? "Tap the bookmark on a learning path to save it here." : "Try a different topic or explore all learning paths."}</p><button className="ec-primary-button" onClick={() => {setGroup("all"); setQuery("");}}>Explore all paths<ArrowRight size={14}/></button></div>}</> : tab === "packs" ? <><div className="ec-tab-intro"><span className="ec-page-eyebrow">MAKE A LITTLE PROGRESS TODAY</span><h2>One good lesson at a time.</h2><p>Short explanations. Useful exercises. Skills you can put to work.</p></div><PackGrid store={store} open={packOpen}/></> : <><div className="ec-tab-intro"><span className="ec-page-eyebrow">TURN LEARNING INTO DOING</span><h2>Make something you’re proud of.</h2><p>Choose a project, follow the brief, and bring your skills together.</p></div><ProjectGrid store={store} open={projectOpen} category={category} setCategory={setCategory}/></>}<GuideList/></div></div></section><section className="ec-grow-banner ec-container"><span className="ec-grow-art"><Rocket size={48} strokeWidth={1.4}/></span><div><span className="ec-page-eyebrow">YOUR AMBITION. YOUR OWN PACE.</span><h2>You don’t need the whole plan.<br/>Just a good next step.</h2><p>Give your goals a little structure with a personalized learning path.</p></div><a href="/ai" className="ec-primary-button">Let’s find your direction<ArrowRight size={16}/></a></section></main><Footer/></>;
}

function LessonViewer({pack, store, onClose}: {pack: LessonPack; store: LearningStore; onClose: () => void}) {
  const [index, setIndex] = useState(0);
  const topic = getTopic(pack.topic);
  const done = store.learning.lessons[pack.id] ?? [];
  const lesson = pack.lessons[index];
  const notes: Record<string, string> = {
    "Repositories & commits": "A repository records your project's history. Use git init to start one, git add to stage a focused change, and git commit to record it. Inspect git diff before committing so you know exactly what you are saving.",
    "Inspecting changes": "Use git status to see changed files, git diff to inspect edits, and git log to read committed history. Review both staged and unstaged changes before creating a commit.",
    "Branching": "A branch gives a change its own line of work. Create one with git switch -c followed by a descriptive name. Keep it focused on one feature or fix so reviewing and merging stay manageable.",
    "Merging": "A merge combines the history of two branches. Switch to the receiving branch, check its current state, and merge the feature branch. Review and verify the resulting application before moving on.",
    "Resolving conflicts": "A conflict means Git cannot decide how to combine overlapping edits. Read both versions, choose the desired behavior, remove conflict markers, and test the result. Stage the resolved files and complete the merge.",
    "Remote repositories": "A remote is another copy of the repository. Fetch retrieves its history, pull integrates updates, and push publishes your commits. Read incoming changes before integrating them.",
    "Pull requests": "A pull request invites review of a proposed change. Explain the problem, resulting behavior, and verification steps. Respond to feedback with focused edits and check the combined result before merging.",
    "A team workflow": "Agree on a default branch and a small review process. Work in focused branches, commit coherent changes, and share pull requests early enough for useful feedback. Keep setup instructions current.",
    "How the web connects": "A browser asks a server for resources. DNS turns a domain into a network address, HTTP describes the request and response, and the browser uses returned resources to construct a page.",
    "IP addresses & DNS": "An IP address identifies a network endpoint. DNS maps names to records such as addresses. Caches make repeated lookups faster, and a record's TTL affects how long a cached answer may be reused.",
    "HTTP requests": "A request contains a method, a target, headers, and sometimes a body. A response contains a status code, headers, and optional content. Inspect both sides using the network panel in your browser.",
    "Status codes & headers": "Status codes summarize a result: success, redirect, client error, or server error. Headers describe content, caching, authentication, and other metadata. Avoid treating every failure as the same error.",
    "HTTPS": "HTTPS carries HTTP over an encrypted, authenticated connection. It protects data in transit and lets the browser verify the server's identity. It does not automatically make an application's access checks correct.",
    "Browsers & hosting": "A hosting service makes resources available to clients. The browser parses HTML, applies CSS, and executes JavaScript. Learn to distinguish a deployment failure from a rendering or application error.",
    "Document structure": "Start with a document type, html language, head metadata, and body content. Use a meaningful title and viewport metadata. Structure the page around a clear primary heading and semantic landmarks.",
    "Text & headings": "Use headings to describe a logical outline. Choose their level for meaning and use CSS for appearance. Use paragraphs, emphasis, and lists to make content easy to navigate and understand.",
    "Links & images": "Use descriptive link text that explains the destination. Give meaningful images useful alternative text and leave purely decorative images with empty alternatives. Supply dimensions to reduce layout shifts.",
    "Semantic elements": "Use header, nav, main, section, article, and footer where they express the content's role. Native buttons and links already provide important keyboard and accessibility behavior.",
    "Lists & tables": "Use ordered lists for sequences, unordered lists for parallel items, and tables for comparable data. Give tables proper headers and a caption when it explains their purpose.",
    "Forms & labels": "Connect every input to a visible label. Choose appropriate types, describe constraints, and show helpful validation messages. A placeholder is a hint; it does not replace a label.",
    "Accessibility": "Try the entire page with a keyboard. Make focus visible, keep controls labeled, and ensure information is not conveyed by color alone. Check text contrast and sensible heading order.",
    "Build a profile page": "Combine semantic structure, links, images, and a small form into a profile. Include a short introduction and project descriptions. Verify the page without a mouse and with larger text.",
    "Selectors & the cascade": "Selectors decide which elements a rule matches. Origin, importance, specificity, and source order determine which declaration wins. Inspect computed styles before adding a stronger selector.",
    "The box model": "Each box includes content, padding, borders, and margins. With border-box sizing, declared width includes padding and borders. Use developer tools to inspect the dimensions instead of guessing.",
    "Typography": "Choose readable text sizes, line heights, and line lengths. Establish a small type hierarchy and test zoom. Use a sensible fallback stack so content stays readable while fonts load.",
    "Colors & contrast": "Choose colors for clear hierarchy and readable contrast. Test text on its actual background. Reinforce status with words or icons so a color change is not the only signal.",
    "Flexbox": "Flexbox arranges items along a main axis and a cross axis. Use it for navigation, aligned actions, and flexible rows. Learn how flex-basis, grow, shrink, and wrapping affect the result.",
    "CSS Grid": "Grid defines rows and columns for two-dimensional layouts. Start with explicit columns, then use flexible tracks and gaps. Let content drive sizing and check narrow screens.",
    "Responsive layouts": "A responsive layout adapts to available space. Start with a simple narrow-screen flow, add columns when content fits, and avoid fixed widths that create horizontal overflow.",
    "Build a card grid": "Create a set of semantic cards using Grid with a consistent gap. Let the columns collapse as space narrows. Test long titles, missing descriptions, and keyboard focus.",
    "Positioning": "Understand static, relative, absolute, fixed, and sticky positioning. An absolutely positioned element uses its containing block; a sticky element also depends on its scroll container.",
    "Transitions": "Use short transitions to clarify state changes such as focus, expansion, or progress. Avoid animation that blocks interaction and respect prefers-reduced-motion.",
    "Values & variables": "JavaScript values have types such as strings, numbers, booleans, objects, and undefined. Prefer const for bindings you do not reassign. Compare values carefully and be explicit about conversion.",
    "Functions": "A function gives a reusable operation a name, parameters, and a return value. Keep it focused, describe its inputs, and test it with ordinary and edge-case values.",
    "Arrays & objects": "Arrays model ordered collections and objects model named fields. Practise map, filter, find, and reduce. Avoid mutating shared data when other code depends on its previous state.",
    "Control flow": "Use conditions to choose behavior and loops to repeat work. Handle invalid or empty inputs early. Keep nested conditions understandable and test boundary cases.",
    "DOM & events": "The DOM exposes the page as a tree. Event listeners respond to actions, and native form controls provide useful built-in behavior. Update content safely and remove listeners when their owner is disposed.",
    "Modules": "Modules give files explicit imports and exports. Keep related logic together and separate pure logic from effects. A dependency should have a clear reason to be imported.",
    "Promises": "A promise represents an asynchronous result. Use await to express dependent steps and catch errors where you can handle them. Start independent operations together when appropriate.",
    "Fetching data": "Check the response status, validate the data shape, and show loading, success, empty, and failure states. Prevent an older response from replacing a newer result.",
    "Error handling": "An error message should describe what failed and how the user can recover. Preserve useful work, log enough context for diagnosis, and avoid exposing credentials or private data.",
    "Build a task list": "Use a form to add tasks, buttons to update status, and filters to change the view. Give every control an accessible name and save records so a reload restores them.",
    "The Node.js runtime": "Node.js runs JavaScript outside a browser. Learn the difference between browser APIs and Node modules, and understand how asynchronous I/O lets it handle waiting operations.",
    "Arguments & input": "Read process.argv for arguments and use standard input for piped data. Validate inputs, provide help text, and avoid placing credentials in command-line arguments.",
    "Files & paths": "Use Node's file and path modules to read and write data. Handle a missing file and invalid encoding explicitly. Keep paths portable and avoid overwriting user files unexpectedly.",
    "Dependencies": "Record runtime dependencies in the manifest and commit the lockfile. Read a package's documentation and keep its use focused. Use scripts to make common commands repeatable.",
    "Errors & exit codes": "Send ordinary results to standard output and errors to standard error. Return a nonzero exit code when the command fails so scripts can respond correctly.",
    "Build a CLI tool": "Create a small command that accepts input, validates it, performs one useful task, and reports a clear result. Add help text and test both successful and failing inputs.",
  };
  return <Modal title={pack.title} onClose={onClose} className="ec-course-dialog"><div className="ec-course-layout"><aside className="ec-course-sidebar"><p>{done.length} of {pack.lessons.length} lessons complete</p><div className="ec-mini-track"><span style={{width: done.length / pack.lessons.length * 100 + "%"}}/></div>{pack.lessons.map((l, i) => <button key={l} className={index === i ? "active" : ""} onClick={() => setIndex(i)}>{done.includes(i) ? <CheckCircle2 size={15}/> : <span className="ec-lesson-number">{i + 1}</span>}<span>{l}</span></button>)}</aside><article className="ec-lesson-content"><span className="ec-article-eyebrow">LESSON {index + 1} OF {pack.lessons.length}</span><h3>{lesson}</h3><p>{notes[lesson] ?? topic.summary}</p><h4>Put it into practice</h4><p>{topic.exercise}</p><h4>Before you continue</h4><ul><li>Explain this lesson in your own words.</li><li>Try a small example and inspect the result.</li><li>Use the reference to answer one question you still have.</li></ul><div className="ec-resource-list">{topic.resources.map(r => <a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title}<ExternalLink size={14}/></a>)}</div><div className="ec-lesson-actions"><button className={"ec-primary-button" + (done.includes(index) ? " ec-completed-button" : "")} onClick={() => store.toggleStep("lessons", pack.id, index)}><Check size={15}/>{done.includes(index) ? "Completed · Undo" : "Mark lesson complete"}</button>{index < pack.lessons.length - 1 && <button className="ec-plain-button" onClick={() => setIndex(index + 1)}>Next lesson<ArrowRight size={15}/></button>}</div></article></div></Modal>;
}

function ProjectViewer({project, store, onClose}: {project: ProjectIdea; store: LearningStore; onClose: () => void}) {
  const done = store.learning.projects[project.id] ?? [];
  return <Modal title={project.title} onClose={onClose}><div className="ec-project-detail"><div className="ec-project-labels"><span className={"ec-difficulty ec-" + project.difficulty.toLowerCase()}>{project.difficulty}</span><span>{project.category}</span></div><p>{project.description}</p><h3>Project requirements</h3><div className="ec-project-checklist">{project.tasks.map((t, i) => <label key={t}><input type="checkbox" checked={done.includes(i)} onChange={() => store.toggleStep("projects", project.id, i)}/><span>{t}</span></label>)}</div><h3>Skills you will practise</h3><div className="ec-tags">{project.skills.map(s => <span key={s}>{s}</span>)}</div><div className="ec-project-progress"><CheckCircle2 size={16}/>{done.length} of {project.tasks.length} requirements complete</div><p className="ec-small-note">Your checklist is saved in this browser. Keep your project code and demo alongside it.</p></div></Modal>;
}

function AssignmentWork({topic, item, store, onComplete}: {topic: Topic; item: CatalogItem; store: LearningStore; onComplete?: () => void}) {
  const assignment = getAssignment(topic, item);
  const key = assignmentKey(item.slug, topic.id);
  const completed = store.learning.assignments[key] ?? [];
  const count = assignment.tasks.filter(task => completed.includes(task.id)).length;
  const allDone = count === assignment.tasks.length;
  const markedDone = store.learning.progress[item.slug]?.[topic.id] === "done";
  return <div className="ec-assignment-work">
    <fieldset className="ec-task-checklist"><legend><ListChecks size={16}/>Your tasks<span>{count} / {assignment.tasks.length}</span></legend>
      {assignment.tasks.map((task, index) => <label key={task.id} className={completed.includes(task.id) ? "ec-task-checked" : ""}>
        <input type="checkbox" checked={completed.includes(task.id)} disabled={!store.ready} onChange={() => store.toggleTask(item.slug, topic.id, task.id)}/>
        <span><strong><small>{String(index + 1).padStart(2, "0")}</small>{task.title}</strong><span>{task.description}</span></span>
      </label>)}
    </fieldset>
    <div className="ec-assignment-deliverable"><FlagIcon/><div><strong>What to deliver</strong><p>{assignment.deliverable}</p></div></div>
    <details className="ec-assignment-criteria"><summary>Before you mark it complete<ChevronDown size={15}/></summary><ul>{assignment.checks.map(check => <li key={check}>{check}</li>)}</ul></details>
    <label className="ec-evidence-label">Work link <span>(optional)</span><input type="url" maxLength={500} placeholder="Repository, demo, or document URL" value={store.learning.evidence[key] ?? ""} onChange={event => store.updateEvidence(key, event.target.value)}/></label>
    <div className="ec-assignment-finish"><button className="ec-primary-button" disabled={!store.ready || !allDone || markedDone} onClick={() => {store.updateStatus(item.slug, topic.id, "done"); onComplete?.();}}><Check size={16}/>{markedDone && allDone ? "Assignment complete" : "Complete assignment"}</button><span>{allDone ? "Self-checked · keep your work as evidence" : "Check each task after completing the work"}</span></div>
  </div>;
}

function FlagIcon() {return <Target size={19} aria-hidden="true"/>;}

function TopicDrawer({topic, item, store, onClose}: {topic: Topic; item: CatalogItem; store: LearningStore; onClose: () => void}) {
  const status = store.learning.progress[item.slug]?.[topic.id];
  const noteKey = item.slug + ":" + topic.id;
  const assignment = getAssignment(topic, item);
  return <Modal title={topic.title} onClose={onClose} className="ec-topic-dialog"><div className="ec-topic-content">
    <span className="ec-topic-kicker">{item.title} roadmap</span><p>{topic.summary}</p>
    <div className="ec-status-picker" aria-label="Topic progress"><button className={!status ? "active" : ""} onClick={() => store.updateStatus(item.slug, topic.id)}><Circle size={14}/>Not started</button><button className={status === "learning" ? "active" : ""} onClick={() => store.updateStatus(item.slug, topic.id, "learning")}><Clock3 size={14}/>Learning</button><span className={"ec-topic-status" + (status === "done" ? " ec-green" : "")}><CheckCircle2 size={14}/>{status === "done" ? "Complete" : "Finish the assignment to complete"}</span><button className={status === "skipped" ? "active" : ""} onClick={() => store.updateStatus(item.slug, topic.id, "skipped")}><ArrowRight size={14}/>Skip</button></div>
    <div className="ec-assignment-heading"><span className="ec-page-eyebrow">YOUR PRACTICE ASSIGNMENT</span><h3>{assignment.title}</h3><span><Clock3 size={14}/>{assignment.hours} hour practice estimate</span></div>
    <AssignmentWork topic={topic} item={item} store={store} onComplete={onClose}/>
    <h3>Learn what you need</h3><ol>{topic.steps.map(s => <li key={s}>{s}</li>)}</ol>
    <h3>Recommended resources</h3><div className="ec-resource-list">{topic.resources.map(r => <a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title}<ExternalLink size={14}/></a>)}</div>
    <label className="ec-notes-label" htmlFor="topic-notes">Your notes</label><textarea id="topic-notes" rows={4} maxLength={5000} placeholder="Record a bug you fixed, a verification result, or your next step…" value={store.learning.notes[noteKey] ?? ""} onChange={e => store.updateNote(noteKey, e.target.value)}/>
    <p className="ec-small-note">Tasks, work links, and notes save automatically in this browser. Completion is your own assessment of the work.</p>
  </div></Modal>;
}

function AssignmentBoard({item, store}: {item: CatalogItem; store: LearningStore}) {
  return <div className="ec-assignment-board"><div className="ec-assignment-board-intro"><ListChecks size={24}/><div><h2>Learn by doing.</h2><p>Work through these assignments in roadmap order. Build the deliverable, verify the conditions, then mark the topic complete.</p></div></div>
    {getStages(item).map((stage, index) => <section key={stage.title} className="ec-assignment-stage"><h2><span>{String(index + 1).padStart(2, "0")}</span>{stage.title}</h2>
      {stage.topics.map(id => {const topic = getTopic(id), assignment = getAssignment(topic, item); return <article key={id} className="ec-assignment-card"><div className="ec-assignment-card-heading"><div><span className="ec-topic-kicker">{topic.title}</span><h3>{assignment.title}</h3></div><span><Clock3 size={14}/>{assignment.hours}h practice</span></div><AssignmentWork topic={topic} item={item} store={store}/></article>;})}
    </section>)}
  </div>;
}

function RoadmapDiagram({item, store, select, svgRef, zoom}: {item: CatalogItem; store: LearningStore; select: (t: Topic) => void; svgRef: React.RefObject<SVGSVGElement | null>; zoom: number}) {
  const stages = getStages(item);
  const height = stages.length * 180 + 190;
  function box(id: string, column: number, y: number) {
    const topic = getTopic(id), status = store.learning.progress[item.slug]?.[id];
    const x = 90 + column * 263, width = 246;
    const words = topic.title.split(" "), wrap = topic.title.length > 25;
    const first = wrap ? words.slice(0, Math.ceil(words.length / 2)).join(" ") : topic.title;
    const second = wrap ? words.slice(Math.ceil(words.length / 2)).join(" ") : "";
    const stroke = status === "done" ? "#86b89c" : status === "learning" ? "#90b5ce" : "#d9e2db";
    const fill = status === "done" ? "#eef8f1" : status === "learning" ? "#eff6fc" : status === "skipped" ? "#f0f1ef" : column === 0 ? "#edf3e9" : "#ffffff";
    return <g key={id} className="ec-svg-node" role="button" tabIndex={0} aria-label={"Learn " + topic.title + (status ? ", " + status : "")} onClick={() => select(topic)} onKeyDown={e => {if (e.key === "Enter" || e.key === " ") {e.preventDefault(); select(topic);}}}>
      <rect x={x} y={y} width={width} height="100" rx="13" fill={fill} stroke={stroke} strokeWidth="1.4"/>
      <text x={x + 18} y={y + 23} fontSize="9" fontFamily="ui-sans-serif, system-ui" letterSpacing="1.2" fill="#5c6d61">{column === 0 ? "CORE FOCUS" : "SUPPORTING SKILL"}</text>
      <text x={x + 18} y={y + (wrap ? 48 : 55)} fontSize="16" fill="#273f32" fontWeight="600" fontFamily="ui-sans-serif, system-ui">{first}{wrap && <tspan x={x + 18} dy="19">{second}</tspan>}</text>
      <text x={x + 18} y={y + 85} fontSize="10" fill={status === "done" ? "#37694f" : "#627266"} fontFamily="ui-sans-serif, system-ui">{status === "done" ? "Completed" : status === "learning" ? "You’re learning this" : status === "skipped" ? "Skipped for now" : "Explore this step"}</text>
      {status === "done" ? <g aria-hidden="true"><circle cx={x + width - 23} cy={y + 23} r="10" fill="#39795a"/><path d={`M ${x + width - 28} ${y + 23} l 4 4 l 6 -7`} fill="none" stroke="#fff" strokeWidth="1.7"/></g> : <path d={`M ${x + width - 31} ${y + 77} h 9 m -4 -4 l 4 4 l -4 4`} stroke="#93a399" strokeWidth="1.4" fill="none"/>}
    </g>;
  }
  return <svg ref={svgRef} viewBox={`0 0 900 ${height}`} width={900 * zoom} height={height * zoom} className="ec-roadmap-svg" role="group" aria-label={item.title + " interactive learning roadmap"}>
    <title>{`${item.title} — EaseCareer interactive roadmap`}</title><rect width="900" height={height} fill="#f7f9f5"/>
    <rect x="16" y="12" width="868" height="102" rx="15" fill="#fff" stroke="#e3e9e1"/>
    <text x="38" y="41" fontFamily="ui-sans-serif, system-ui" fontSize="11" letterSpacing="1.6" fill="#566f5f">YOUR LEARNING JOURNEY</text>
    <text x="38" y="72" fontFamily="ui-sans-serif, system-ui" fontSize="21" fill="#294433" fontWeight="600">Make a little progress, one step at a time.</text>
    <text x="38" y="96" fontFamily="ui-sans-serif, system-ui" fontSize="12" fill="#5c6d63">Select a skill card for assigned tasks, deliverables, and resources.</text>
    <circle cx="692" cy="43" r="5" fill="#d9e8d4"/><text x="706" y="47" fontFamily="ui-sans-serif, system-ui" fontSize="11" fill="#586e60">To learn</text>
    <circle cx="692" cy="72" r="5" fill="#39795a"/><text x="706" y="76" fontFamily="ui-sans-serif, system-ui" fontSize="11" fill="#586e60">Completed</text>
    <path d={`M44 197 L44 ${height - 78}`} stroke="#c4d8c7" strokeWidth="2" strokeDasharray="4 7" fill="none"/>
    {stages.map((stage, i) => {const y = 160 + i * 180; return <g key={i}>
      <text x="90" y={y - 15} fontFamily="ui-sans-serif, system-ui" fontSize="13" fontWeight="500" fill="#576f60">{stage.title}</text>
      <circle cx="44" cy={y + 47} r="17" fill="#e5efe0" stroke="#c4d8c7"/>
      <text x="44" y={y + 52} textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="600" fill="#4e7158">{String(i + 1).padStart(2, "0")}</text>
      <path d={`M61 ${y + 47} H82`} stroke="#c4d8c7" strokeWidth="1.5" fill="none"/>
      {stage.topics.map((id, col) => box(id, col, y))}
    </g>;})}
    <rect x="90" y={height - 78} width="772" height="54" rx="12" fill="#e9f0e4"/>
    <text x="112" y={height - 45} fontFamily="ui-sans-serif, system-ui" fontSize="14" fill="#4e7158">Build. Reflect. Keep growing.</text>
    <text x="840" y={height - 45} textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="12" fill="#546f5d">EaseCareer</text>
  </svg>;
}

function RoadmapPage({item, store, query, setQuery, notify}: {item: CatalogItem; store: LearningStore; query: string; setQuery: (s: string) => void; notify: (s: string) => void}) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [view, setView] = useState<"map" | "list" | "assignments">("map");
  const [zoom, setZoom] = useState(1);
  const [info, setInfo] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stages = getStages(item), ids = stages.flatMap(s => s.topics);
  const work = ids.map(id => {
    const topic = getTopic(id), assignment = getAssignment(topic, item);
    const checked = store.learning.assignments[assignmentKey(item.slug, id)] ?? [];
    return {topic, assignment, completed: assignment.tasks.filter(task => checked.includes(task.id)), checked};
  });
  const taskTotal = work.reduce((sum, row) => sum + row.assignment.tasks.length, 0);
  const taskDone = work.reduce((sum, row) => sum + row.completed.length, 0);
  const nextAssignment = work.find(row => row.completed.length < row.assignment.tasks.length && store.learning.progress[item.slug]?.[row.topic.id] !== "skipped");
  const nextTask = nextAssignment?.assignment.tasks.find(task => !nextAssignment.checked.includes(task.id));
  const done = ids.filter(id => store.learning.progress[item.slug]?.[id] === "done").length;
  const percentage = Math.round(done / ids.length * 100);
  const saved = store.learning.favorites.includes(item.slug);
  const roleTitle = ["Frontend", "Backend", "Full Stack"].includes(item.title) ? item.title + " Developer" : item.title;
  function fit() {if (scrollRef.current) {setZoom(Math.max(.65, Math.min(1, (scrollRef.current.clientWidth - 8) / 900))); requestAnimationFrame(() => {const el = scrollRef.current; if (el) el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);});}}
  useEffect(() => {fit();}, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "assignments") setView("assignments");
    const requestedTopic = params.get("topic");
    if (requestedTopic && getStages(item).some(stage => stage.topics.includes(requestedTopic))) setTopic(getTopic(requestedTopic));
  }, [item.slug]);
  async function share() {try {await navigator.clipboard.writeText(window.location.href); notify("Roadmap link copied.");} catch {notify("Copy the roadmap URL from your browser to share it.");}}
  function download() {
    if (!svgRef.current) return;
    const svg = svgRef.current.cloneNode(true) as SVGSVGElement;
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "900"); svg.setAttribute("height", String(stages.length * 180 + 190));
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], {type: "image/svg+xml"}));
    const a = document.createElement("a"); a.href = url; a.download = "easecareer-" + item.slug + "-roadmap.svg"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify("Roadmap downloaded as SVG.");
  }
  return <><Header light><div className="ec-header-search"><SearchBox query={query} setQuery={setQuery}/></div></Header><main className="ec-roadmap-page"><div className="ec-container">
    <section className="ec-roadmap-heading"><div className="ec-roadmap-heading-top"><a href="/" className="ec-all-roadmaps"><ArrowLeft size={14}/>All Roadmaps</a><div className="ec-roadmap-tools"><button className={"ec-icon" + (saved ? " is-saved" : "")} aria-label={saved ? "Remove from favorites" : "Save to favorites"} aria-pressed={saved} onClick={() => store.toggleFavorite(item.slug)}><Bookmark size={18} fill={saved ? "currentColor" : "none"}/></button><button className="ec-primary-button" onClick={() => {if (view !== "map") {setView("map"); notify("Map opened. Click Download again to export it.");} else download();}}><ArrowDownToLine size={16}/><span>Download</span></button><button className="ec-primary-button ec-square" onClick={share} aria-label="Share roadmap"><Share2 size={16}/></button></div></div><h1>{roleTitle}</h1><p>A step-by-step learning path to develop your {item.title.toLowerCase()} skills in {new Date().getFullYear()}.</p><div className="ec-detail-tabs"><button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><Map size={16}/>Roadmap</button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><ListFilter size={16}/>Topics</button><button className={view === "assignments" ? "active" : ""} onClick={() => setView("assignments")}><ListChecks size={16}/>Assignments</button><a href="/ai"><Sparkles size={15}/>AI Tutor</a><a href={"/ai?goal=" + encodeURIComponent(roleTitle)} className="ec-personalize"><Target size={14}/>Personalize</a></div></section>
    <div className="ec-progress-banner"><div><GraduationCap size={16}/><span>{done > 0 ? `${done} of ${ids.length} topics complete. Keep going!` : "Track what you learn and build your path, one topic at a time."}</span></div><a href="/my-learning">My progress<ArrowRight size={13}/></a></div><div className="ec-roadmap-progress"><span style={{width: percentage + "%"}}/></div>
    <section className="ec-next-assignment" aria-label="Your next assignment"><div className="ec-next-assignment-copy"><span className="ec-page-eyebrow"><ListChecks size={14}/>YOUR NEXT ASSIGNMENT</span>{nextAssignment && nextTask ? <><h2>{nextAssignment.assignment.title}</h2><p><strong>Next task: {nextTask.title}.</strong> {nextTask.description}</p><div className="ec-next-assignment-meta"><span><Clock3 size={14}/>{nextAssignment.assignment.hours}h practice estimate</span><span>{taskDone} / {taskTotal} roadmap tasks checked</span></div></> : <><h2>Review the work you have completed.</h2><p>{taskDone} of {taskTotal} tasks checked. Open your assignments to review deliverables, finish topics, or return to a skipped assignment.</p></>}</div><div className="ec-next-assignment-actions">{nextAssignment && <button className="ec-primary-button" onClick={() => {setTopic(nextAssignment.topic); if (!store.learning.progress[item.slug]?.[nextAssignment.topic.id]) store.updateStatus(item.slug, nextAssignment.topic.id, "learning");}}>Open assignment<ArrowRight size={16}/></button>}<button className="ec-plain-button" onClick={() => setView("assignments")}>View all {taskTotal} tasks<ArrowUpRight size={15}/></button></div></section>
    <button className="ec-roadmap-about" onClick={() => setInfo(!info)} aria-expanded={info}><span><Circle size={14}/>What will I learn in this roadmap?</span><ChevronDown size={16} className={info ? "ec-rotate" : ""}/></button>{info && <div className="ec-roadmap-info">This path covers {ids.length} topics and {taskTotal} practical tasks across {stages.length} stages. Use Assignments to see what to perform, what to deliver, and how to check the result. Select a topic for supporting learning steps and official resources. Use AI Tutor to adapt a path to your experience and weekly schedule.</div>}
    {view === "assignments" ? <AssignmentBoard item={item} store={store}/> : <div className="ec-diagram-scroll" ref={scrollRef}>{view === "map" ? <RoadmapDiagram item={item} store={store} select={setTopic} svgRef={svgRef} zoom={zoom}/> : <div className="ec-topic-list">{stages.map((s, i) => <section key={i}><h2><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>{s.topics.map(id => {const t = getTopic(id), status = store.learning.progress[item.slug]?.[id]; return <button key={id} onClick={() => setTopic(t)}>{status === "done" ? <CheckCircle2 size={18} className="ec-green"/> : <Circle size={18}/>}<span><strong>{t.title}</strong><small>{t.summary}</small></span><ChevronRight size={17}/></button>;})}</section>)}</div>}</div>}
    {view === "map" && <div className="ec-zoom-toolbar"><span>{percentage}% complete</span><div><button aria-label="Zoom out" onClick={() => setZoom(v => Math.max(.4, +(v - .1).toFixed(2)))}><Minus size={16}/></button><span>{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" onClick={() => setZoom(v => Math.min(1.6, +(v + .1).toFixed(2)))}><Plus size={16}/></button><button onClick={fit} className="ec-fit">Fit</button></div></div>}
    <section className="ec-related"><h2>Related learning paths</h2><div className="ec-related-links">{catalog.filter(c => c.group === item.group && c.slug !== item.slug).slice(0, 4).map(c => <a key={c.slug} href={"/" + c.slug}>{c.title}<ArrowRight size={14}/></a>)}</div></section>
  </div></main><Footer/>{topic && <TopicDrawer topic={topic} item={item} store={store} onClose={() => setTopic(null)}/>}</>;
}

function LearningPage({store}: {store: LearningStore}) {
  const saved = catalog.filter(c => store.learning.favorites.includes(c.slug));
  const active = catalog.filter(c => Object.keys(store.learning.progress[c.slug] ?? {}).length > 0);
  const completed = Object.values(store.learning.progress).flatMap(p => Object.values(p)).filter(s => s === "done").length;
  const lessonCount = Object.values(store.learning.lessons).reduce((n, a) => n + a.length, 0);
  const taskCount = Object.values(store.learning.assignments).reduce((n, a) => n + a.length, 0);
  return <><Header/><main className="ec-container ec-learning-page"><div className="ec-page-eyebrow">YOUR LEARNING SPACE</div><h1>Keep your momentum.</h1><p className="ec-page-intro">Your favorite paths and the progress you have made, all in one place.</p><div className="ec-learning-stats"><div><ListChecks size={21}/><strong>{taskCount}</strong><span>Tasks completed</span></div><div><CheckCircle2 size={21}/><strong>{completed}</strong><span>Topics completed</span></div><div><BookOpen size={21}/><strong>{lessonCount}</strong><span>Lessons completed</span></div><div><Bookmark size={21}/><strong>{saved.length}</strong><span>Saved roadmaps</span></div></div><section className="ec-catalog-group"><div className="ec-section-label"><h2>Continue learning</h2></div>{active.length ? <div className="ec-active-paths">{active.map(c => {const total = getStages(c).flatMap(s => s.topics).length, count = Object.values(store.learning.progress[c.slug]).filter(s => s === "done").length; return <a key={c.slug} href={"/" + c.slug}><div><strong>{c.title}</strong><span>{count} / {total} topics completed</span></div><div className="ec-mini-track"><span style={{width: count / total * 100 + "%"}}/></div><ArrowRight size={19}/></a>;})}</div> : <div className="ec-empty-state"><Map size={30}/><h3>Your next step starts here.</h3><p>Open a roadmap and mark a topic as learning or done. Your progress will appear here.</p><a href="/" className="ec-primary-button">Explore roadmaps<ArrowRight size={15}/></a></div>}</section><section className="ec-catalog-group"><div className="ec-section-label"><h2>Saved roadmaps</h2><span>{saved.length}</span></div>{saved.length ? <div className="ec-roadmap-grid">{saved.map(c => <RoadmapCard key={c.slug} item={c} store={store}/>)}</div> : <div className="ec-bookmark-tip"><Bookmark size={18}/>Use the bookmark on any roadmap to save it here.</div>}</section><a href="/ai" className="ec-learning-ai"><Sparkles size={26}/><div><h3>Make the path your own.</h3><p>Plan around your current skills, goal, and available time with AI Tutor.</p></div><ArrowUpRight size={22}/></a><p className="ec-storage-note">Catalog tasks, work links, and progress are saved in this browser. AI Tutor also supports your existing signed-in saved roadmaps.</p></main><Footer/></>;
}

function ArticlePage({guide}: {guide: Guide}) {
  return <><Header/><main className="ec-container ec-article-page"><a href="/guides" className="ec-back-link"><ArrowLeft size={15}/>All guides</a><span className="ec-article-eyebrow">{guide.category}</span><h1>{guide.title}</h1><p className="ec-article-intro">{guide.intro}</p>{guide.sections.map(s => <section key={s.title}><h2>{s.title}</h2><p>{s.body}</p></section>)}<a href="/full-stack" className="ec-primary-button">Explore a learning path<ArrowRight size={15}/></a></main><Footer/></>;
}

export default function EaseCareer({route = "home", articleId, initialTab = "roadmaps"}: {route?: string; articleId?: string; initialTab?: "roadmaps" | "packs" | "projects"}) {
  const store = useLearning();
  const [tab, setTab] = useState<"roadmaps" | "packs" | "projects">(initialTab);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [pack, setPack] = useState<LessonPack | null>(null);
  const [project, setProject] = useState<ProjectIdea | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {const value = new URLSearchParams(window.location.search).get("tab"); if (value === "packs" || value === "projects") setTab(value);}, []);
  useEffect(() => {if (!notice) return; const t = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(t);}, [notice]);
  function changeTab(value: typeof tab) {setTab(value); setQuery(""); const url = new URL(window.location.href); url.pathname = "/"; if (value === "roadmaps") url.searchParams.delete("tab"); else url.searchParams.set("tab", value); window.history.replaceState({}, "", url);}
  const item = catalog.find(c => c.slug === route);
  const guide = guides.find(g => g.id === articleId);
  let content: ReactNode;
  if (item) content = <RoadmapPage item={item} store={store} query={query} setQuery={setQuery} notify={setNotice}/>;
  else if (route === "my-learning") content = <LearningPage store={store}/>;
  else if (route === "guides" && guide) content = <ArticlePage guide={guide}/>;
  else if (route === "guides") content = <><Header/><main className="ec-container ec-guides-page"><h1>A little guidance.<br/><span>A lot of progress.</span></h1><p className="ec-page-intro">Practical explanations to help you learn, build, and find your next step.</p><GuideList all/></main><Footer/></>;
  else content = <HomePage store={store} tab={tab} changeTab={changeTab} query={query} setQuery={setQuery} packOpen={setPack} projectOpen={setProject} category={category} setCategory={setCategory}/>;
  return <div id="top" className={"ec-app" + (item ? " ec-app-light" : "")}>{content}{pack && <LessonViewer pack={pack} store={store} onClose={() => setPack(null)}/>}{project && <ProjectViewer project={project} store={store} onClose={() => setProject(null)}/>}{(notice || store.storageError) && <div className="ec-toast" role="status"><CheckCircle2 size={17}/><span>{notice || store.storageError}</span><button aria-label="Dismiss notification" onClick={() => {setNotice(""); store.clearStorageError();}}><X size={15}/></button></div>}</div>;
}
