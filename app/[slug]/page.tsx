import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EaseCareer from "../easecareer";
import { catalog } from "@/lib/easecareer-catalog";

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params;
  const title = catalog.find(c => c.slug === slug)?.title ?? (slug === "my-learning" ? "My Learning" : "Learning Guides");
  return {title: `${title} — EaseCareer`, description: `Explore the ${title.toLowerCase()} learning path, official resources, and practical next steps with EaseCareer.`};
}
export default async function RoadmapRoute({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  if (!catalog.some(c => c.slug === slug) && !["my-learning", "guides"].includes(slug)) notFound();
  return <EaseCareer route={slug}/>;
}
