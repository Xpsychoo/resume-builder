/**
 * Resume data model. Everything the app stores, imports or receives through a
 * share link passes through normalizeResume(), so the rest of the code can
 * trust the shape and sizes of the data.
 */

export const SECTION_IDS = ["summary", "experience", "projects", "education", "skills", "certifications"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
};

export const TEMPLATES = ["classic", "modern", "minimal"] as const;
export type TemplateId = (typeof TEMPLATES)[number];

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  classic: "Classic",
  modern: "Modern",
  minimal: "Minimal",
};

export const FONTS = ["sans", "serif"] as const;
export type FontId = (typeof FONTS)[number];

export const DENSITIES = ["comfortable", "compact"] as const;
export type Density = (typeof DENSITIES)[number];

export const ACCENT_PRESETS = ["#2563eb", "#0f766e", "#7c3aed", "#be123c", "#c2410c", "#334155"] as const;

export interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  /** One bullet per line. */
  highlights: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  tech: string;
  highlights: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  score: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  /** Comma-separated. */
  items: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface SectionSetting {
  id: SectionId;
  visible: boolean;
}

export interface DesignSettings {
  template: TemplateId;
  accent: string;
  font: FontId;
  density: Density;
}

export interface Resume {
  version: 1;
  profile: Profile;
  summary: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  certifications: CertificationItem[];
  sections: SectionSetting[];
  settings: DesignSettings;
}

export type ListKey = "experience" | "projects" | "education" | "skills" | "certifications";

export const LIMITS = { shortText: 120, longText: 3000, items: 25 } as const;

let idCounter = 0;
/** Short unique id for list items (stable within a session, not security-sensitive). */
export function newId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}${idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const emptyProfile = (): Profile => ({ name: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" });

export const emptyItem = {
  experience: (): ExperienceItem => ({ id: newId(), role: "", company: "", location: "", start: "", end: "", current: false, highlights: "" }),
  projects: (): ProjectItem => ({ id: newId(), name: "", link: "", tech: "", highlights: "" }),
  education: (): EducationItem => ({ id: newId(), degree: "", school: "", location: "", start: "", end: "", score: "" }),
  skills: (): SkillGroup => ({ id: newId(), label: "", items: "" }),
  certifications: (): CertificationItem => ({ id: newId(), name: "", issuer: "", year: "" }),
} satisfies Record<ListKey, () => unknown>;

export const defaultSections = (): SectionSetting[] => SECTION_IDS.map((id) => ({ id, visible: true }));

export const defaultSettings = (): DesignSettings => ({ template: "classic", accent: ACCENT_PRESETS[0], font: "sans", density: "comfortable" });

export function emptyResume(): Resume {
  return {
    version: 1,
    profile: emptyProfile(),
    summary: "",
    experience: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    sections: defaultSections(),
    settings: defaultSettings(),
  };
}

/** Fictional example so the preview is never empty on first visit. */
export function sampleResume(): Resume {
  return {
    ...emptyResume(),
    profile: {
      name: "Aarav Mehta",
      title: "Frontend Developer",
      email: "aarav.mehta@example.com",
      phone: "+91 98765 43210",
      location: "Jaipur, India",
      website: "aaravmehta.example.com",
      linkedin: "linkedin.com/in/aarav-example",
      github: "github.com/aarav-example",
    },
    summary:
      "Frontend developer with 3+ years of experience building fast, accessible web apps with React and Next.js. " +
      "Comfortable owning features end to end — from API integration to polished, responsive UI.",
    experience: [
      {
        id: newId(),
        role: "Frontend Developer",
        company: "Example Tech Pvt. Ltd.",
        location: "Jaipur",
        start: "Jan 2023",
        end: "",
        current: true,
        highlights:
          "Built role-based dashboards in React and Redux used by 2,000+ staff\nCut page load time by 40% with code splitting and image optimisation\nLed migration of 30+ screens to a shared component library",
      },
      {
        id: newId(),
        role: "Junior Web Developer",
        company: "Sample Studio",
        location: "Remote",
        start: "Jun 2021",
        end: "Dec 2022",
        current: false,
        highlights: "Delivered 15+ responsive client websites with HTML, CSS and JavaScript\nIntegrated REST APIs and form validation for lead capture",
      },
    ],
    projects: [
      {
        id: newId(),
        name: "Price Comparison App",
        link: "example.com/price-app",
        tech: "Next.js, TypeScript, Tailwind CSS",
        highlights: "Compares the same product variant across stores with price history\nServer-rendered pages with structured data for SEO",
      },
    ],
    education: [
      { id: newId(), degree: "B.Tech, Computer Science", school: "Example Institute of Technology", location: "Jaipur", start: "2017", end: "2021", score: "CGPA 8.1" },
    ],
    skills: [
      { id: newId(), label: "Frontend", items: "React, Next.js, TypeScript, JavaScript, Redux, HTML, CSS, Tailwind CSS" },
      { id: newId(), label: "Tools", items: "Git, REST APIs, Vitest, Figma, Vercel" },
    ],
    certifications: [{ id: newId(), name: "Responsive Web Design", issuer: "Example Academy", year: "2022" }],
  };
}

// ---------------------------------------------------------------------------
// Normalisation of untrusted input (localStorage, imported files, share links)
// ---------------------------------------------------------------------------

type Rec = Record<string, unknown>;
const isRecord = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);

function str(v: unknown, max: number = LIMITS.shortText): string {
  if (typeof v !== "string") return "";
  // Drop control characters except tab and newline.
  return v.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").slice(0, max);
}

const text = (v: unknown) => str(v, LIMITS.longText);

function list<T>(v: unknown, map: (r: Rec) => T): T[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isRecord).slice(0, LIMITS.items).map(map);
}

function id(v: unknown): string {
  return typeof v === "string" && /^[a-z0-9]{1,32}$/i.test(v) ? v : newId();
}

function oneOf<T extends string>(v: unknown, options: readonly T[], fallback: T): T {
  return options.includes(v as T) ? (v as T) : fallback;
}

/** Keeps every known section exactly once, in the given order, appending any missing ones. */
function normalizeSections(v: unknown): SectionSetting[] {
  const seen = new Set<SectionId>();
  const out: SectionSetting[] = [];
  if (Array.isArray(v)) {
    for (const entry of v) {
      if (!isRecord(entry)) continue;
      const sid = entry.id as SectionId;
      if (!SECTION_IDS.includes(sid) || seen.has(sid)) continue;
      seen.add(sid);
      out.push({ id: sid, visible: entry.visible !== false });
    }
  }
  for (const sid of SECTION_IDS) if (!seen.has(sid)) out.push({ id: sid, visible: true });
  return out;
}

export function normalizeResume(input: unknown): Resume {
  const r = isRecord(input) ? input : {};
  const p = isRecord(r.profile) ? r.profile : {};
  const s = isRecord(r.settings) ? r.settings : {};
  const defaults = defaultSettings();
  return {
    version: 1,
    profile: {
      name: str(p.name),
      title: str(p.title),
      email: str(p.email),
      phone: str(p.phone),
      location: str(p.location),
      website: str(p.website, 200),
      linkedin: str(p.linkedin, 200),
      github: str(p.github, 200),
    },
    summary: text(r.summary),
    experience: list(r.experience, (e) => ({
      id: id(e.id),
      role: str(e.role),
      company: str(e.company),
      location: str(e.location),
      start: str(e.start),
      end: str(e.end),
      current: e.current === true,
      highlights: text(e.highlights),
    })),
    projects: list(r.projects, (e) => ({ id: id(e.id), name: str(e.name), link: str(e.link, 200), tech: str(e.tech, 300), highlights: text(e.highlights) })),
    education: list(r.education, (e) => ({
      id: id(e.id),
      degree: str(e.degree),
      school: str(e.school),
      location: str(e.location),
      start: str(e.start),
      end: str(e.end),
      score: str(e.score),
    })),
    skills: list(r.skills, (e) => ({ id: id(e.id), label: str(e.label), items: str(e.items, 600) })),
    certifications: list(r.certifications, (e) => ({ id: id(e.id), name: str(e.name), issuer: str(e.issuer), year: str(e.year) })),
    sections: normalizeSections(r.sections),
    settings: {
      template: oneOf(s.template, TEMPLATES, defaults.template),
      accent: typeof s.accent === "string" && /^#[0-9a-f]{6}$/i.test(s.accent) ? s.accent.toLowerCase() : defaults.accent,
      font: oneOf(s.font, FONTS, defaults.font),
      density: oneOf(s.density, DENSITIES, defaults.density),
    },
  };
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/** Non-empty trimmed lines, used for bullet points. */
export function lines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** Non-empty trimmed comma-separated values. */
export function commaList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function dateRange(start: string, end: string, current = false): string {
  const to = current ? "Present" : end.trim();
  const from = start.trim();
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

/**
 * Turns user-entered links into safe hrefs. Only http(s), mailto and tel are
 * produced, so shared resumes can never inject javascript: or data: URLs.
 */
export function safeHref(value: string, kind: "url" | "email" | "phone" = "url"): string | null {
  const v = value.trim();
  if (!v) return null;
  if (kind === "email") return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(v) ? `mailto:${v}` : null;
  if (kind === "phone") {
    const digits = v.replace(/[^\d+]/g, "");
    return /^\+?\d{6,15}$/.test(digits) ? `tel:${digits}` : null;
  }
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Display form of a URL without the protocol or trailing slash. */
export function displayUrl(value: string): string {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function hasContent(resume: Resume, section: SectionId): boolean {
  switch (section) {
    case "summary":
      return resume.summary.trim().length > 0;
    case "skills":
      return resume.skills.some((g) => g.items.trim() || g.label.trim());
    default:
      return resume[section].length > 0;
  }
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}
