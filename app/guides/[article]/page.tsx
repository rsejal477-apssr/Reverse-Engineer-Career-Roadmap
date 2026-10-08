import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EaseCareer from "../../easecareer";
import { guides } from "@/lib/easecareer-catalog";

export async function generateMetadata({params}: {params: Promise<{article: string}>}): Promise<Metadata> {
  const {article} = await params;
  const guide = guides.find(g => g.id === article);
  return {title: `${guide?.title ?? "Guide"} — EaseCareer`, description: guide?.intro};
}
export default async function GuidePage({params}: {params: Promise<{article: string}>}) {
  const {article} = await params;
  if (!guides.some(g => g.id === article)) notFound();
  return <EaseCareer route="guides" articleId={article}/>;
}
