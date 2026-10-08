import { z } from "zod";
import { assignmentKey } from "./assignments";

export type Status = "learning" | "done" | "skipped";
export const learningSchema = z.object({
  favorites: z.array(z.string()).max(200),
  progress: z.record(z.record(z.enum(["learning", "done", "skipped"]))),
  notes: z.record(z.string().max(5000)),
  lessons: z.record(z.array(z.number().int().min(0).max(100))),
  projects: z.record(z.array(z.number().int().min(0).max(100))),
  assignments: z.record(z.array(z.string().max(60)).max(20)).default({}),
  evidence: z.record(z.string().max(500)).default({}),
});
export type Learning = z.infer<typeof learningSchema>;
export const emptyLearning: Learning = {favorites: [], progress: {}, notes: {}, lessons: {}, projects: {}, assignments: {}, evidence: {}};

export function toggleAssignmentTask(learning: Learning, slug: string, topicId: string, taskId: string): Learning {
  const key = assignmentKey(slug, topicId);
  const completed = learning.assignments[key] ?? [];
  const next = completed.includes(taskId) ? completed.filter(id => id !== taskId) : [...completed, taskId];
  return {
    ...learning,
    assignments: {...learning.assignments, [key]: next},
    progress: {...learning.progress, [slug]: {...learning.progress[slug], [topicId]: "learning"}},
  };
}
