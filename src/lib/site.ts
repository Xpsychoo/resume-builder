export const SITE = {
  name: "ResumeCraft",
  title: "ResumeCraft — Free Resume Builder with Live Preview",
  description:
    "Build a clean, ATS-friendly resume in minutes. Live A4 preview, three templates, PDF download and private share links. Free, no sign-up — your data stays in your browser.",
  keywords: ["resume builder", "free resume builder", "CV maker", "ATS friendly resume", "resume PDF", "resume templates", "resume builder India"],
} as const;

export function getSiteUrl(): string {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const raw = process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}
