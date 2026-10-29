import type { Metadata } from "next";
import { SharedViewClient } from "@/components/ClientOnly";

// Shared resumes contain personal details: keep them out of search engines.
export const metadata: Metadata = {
  title: "Shared resume",
  description: "A resume shared with ResumeCraft.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/view" },
};

export default function ViewPage() {
  return <SharedViewClient />;
}
