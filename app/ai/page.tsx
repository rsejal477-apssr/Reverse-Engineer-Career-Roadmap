import type { Metadata } from "next";
import Roadmapper from "../roadmapper";
import { Header } from "../easecareer";
export const metadata: Metadata = {title: "AI Planner — EaseCareer", description: "Build a personalized career roadmap around your skills, available time, and goals."};
export default function AiTutorPage() {return <><div className="ec-app ec-ai-topnav"><Header/></div><Roadmapper/></>;}
