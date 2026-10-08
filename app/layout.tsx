import type { Metadata } from "next";
import "./globals.css";
import "./easecareer.css";
import "./assignments.css";
export const metadata: Metadata = {
  title:"EaseCareer — Find Your Next Chapter",
  description:"Find your next step with career and skill roadmaps, practical lessons, project ideas, and personalized AI learning plans.",
  icons:{icon:"/favicon.svg"},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
