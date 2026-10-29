import { normalizeResume, sampleResume, type Resume } from "./resume";

const KEY = "resumecraft:resume:v1";

/** Saved resume, or the sample on first visit. Storage can be blocked, so every access is guarded. */
export function loadResume(): Resume {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalizeResume(JSON.parse(raw));
  } catch {
    // Corrupt or inaccessible storage: fall back to the sample.
  }
  return sampleResume();
}

export function saveResume(resume: Resume): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(resume));
    return true;
  } catch {
    return false;
  }
}

export function downloadJson(resume: Resume, filename: string): void {
  const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function fileNameFor(resume: Resume, ext: string): string {
  const base = resume.profile.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base || "resume"}-resume.${ext}`;
}
