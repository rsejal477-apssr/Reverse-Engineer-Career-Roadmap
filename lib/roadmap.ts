import { z } from "zod";

export const inputSchema = z.object({
  goal: z.string().trim().min(10, "Describe a specific role in at least 10 characters.").max(200),
  currentSkills: z.array(z.string().trim().min(1).max(60)).max(20),
  hoursPerWeek: z.number().int().min(2).max(40),
  targetMonths: z.number().int().min(1).max(24),
});
export type GoalInput = z.infer<typeof inputSchema>;
export const milestoneTaskSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,60}$/),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(600),
  done: z.boolean().default(false),
});
export type MilestoneTask = z.infer<typeof milestoneTaskSchema>;
export const milestoneSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,60}$/),
  title: z.string().min(2).max(90),
  category: z.enum(["skill", "project", "credential", "role"]),
  phase: z.string().min(1).max(50),
  summary: z.string().min(10).max(600),
  hours: z.number().int().min(1).max(200),
  skills: z.array(z.string().max(60)).max(8),
  prerequisites: z.array(z.string().max(60)).max(12),
  deliverable: z.string().min(5).max(400),
  status: z.enum(["todo", "known", "done"]),
  tasks: z.array(milestoneTaskSchema).max(6).default([]),
});
export type Milestone = z.infer<typeof milestoneSchema>;
export const generatedSchema = z.object({
  title: z.string().min(3).max(100),
  summary: z.string().min(10).max(800),
  milestones: z.array(milestoneSchema).min(5).max(18),
});
export const roadmapSchema = generatedSchema.extend({
  id: z.string().min(1).max(80),
  input: inputSchema,
  source: z.enum(["ai", "example"]),
  createdAt: z.string().datetime(),
});
export type Roadmap = z.infer<typeof roadmapSchema>;
export const adviceSchema = z.object({
  learningSteps: z.array(z.string().min(5).max(300)).min(3).max(6),
  project: z.object({
    title: z.string().min(3).max(100),
    brief: z.string().min(20).max(800),
    steps: z.array(z.string().min(5).max(300)).min(3).max(6),
    deliverable: z.string().min(5).max(400),
  }),
  interviewQuestions: z.array(z.string().min(5).max(300)).min(3).max(6),
});
export type Advice = z.infer<typeof adviceSchema>;

export function validateGraph(milestones: Milestone[]) {
  for (const milestone of milestones) {
    if (new Set(milestone.tasks.map(task => task.id)).size !== milestone.tasks.length) throw new Error("Task IDs must be unique within a milestone.");
  }
  const lookup = new Map(milestones.map(m => [m.id, m]));
  if (lookup.size !== milestones.length) throw new Error("Milestone IDs must be unique.");
  const visiting = new Set<string>(), visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) throw new Error("Milestone prerequisites contain a cycle.");
    if (visited.has(id)) return;
    const node = lookup.get(id);
    if (!node) throw new Error("A prerequisite does not exist.");
    visiting.add(id);
    node.prerequisites.forEach(visit);
    visiting.delete(id); visited.add(id);
  }
  milestones.forEach(m => visit(m.id));
}
export function isFinished(m: Milestone) { return m.status !== "todo"; }
export function schedule(roadmap: Roadmap) {
  validateGraph(roadmap.milestones);
  const lookup = new Map(roadmap.milestones.map(m => [m.id, m]));
  const layers = new Map<string, number>();
  function layer(id: string): number {
    if (layers.has(id)) return layers.get(id)!;
    const node = lookup.get(id)!;
    if (isFinished(node)) { layers.set(id, -1); return -1; }
    const parents = node.prerequisites.map(layer);
    const result = parents.length ? Math.max(...parents) + 1 : 0;
    layers.set(id, result); return result;
  }
  roadmap.milestones.forEach(m => layer(m.id));
  const remaining = roadmap.milestones.filter(m => !isFinished(m));
  const remainingHours = remaining.reduce((sum, m) => sum + m.hours, 0);
  const done = roadmap.milestones.length - remaining.length;
  const ready = remaining.filter(m => m.prerequisites.every(id => isFinished(lookup.get(id)!)));
  const weeks = Math.ceil(remainingHours / roadmap.input.hoursPerWeek);
  return { layers, remainingHours, weeks, done, ready, fits: weeks <= roadmap.input.targetMonths * 4.345 };
}
export function updateProgress(roadmap: Roadmap, id: string, status: Milestone["status"]): Roadmap {
  if (!roadmap.milestones.some(m => m.id === id)) throw new Error("Milestone not found.");
  return { ...roadmap, milestones: roadmap.milestones.map(m => m.id === id ? { ...m, status } : m) };
}
export function updateMilestoneTask(roadmap: Roadmap, id: string, tasks: MilestoneTask[], taskId: string): Roadmap {
  if (!roadmap.milestones.some(m => m.id === id)) throw new Error("Milestone not found.");
  if (!tasks.some(task => task.id === taskId)) throw new Error("Task not found.");
  return {...roadmap, milestones: roadmap.milestones.map(m => m.id !== id ? m : {
    ...m,
    status: m.status === "done" ? "todo" : m.status,
    tasks: tasks.map(task => task.id === taskId ? {...task, done: !task.done} : task),
  })};
}
export function graphLayout(roadmap: Roadmap, showFinished: boolean) {
  const plan = schedule(roadmap);
  const counts = new Map<number, number>();
  let finishedRow = 0;
  return roadmap.milestones.filter(m => showFinished || !isFinished(m)).map(m => {
    const column = plan.layers.get(m.id)!;
    const row = column < 0 ? finishedRow++ : (counts.get(column) ?? 0);
    if (column >= 0) counts.set(column, row + 1);
    return { milestone: m, x: (column + (showFinished ? 1 : 0)) * 275, y: row * 175 + 45 };
  });
}
