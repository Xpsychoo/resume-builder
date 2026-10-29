import type { ReactNode } from "react";
import {
  hasContent,
  commaList,
  dateRange,
  displayUrl,
  lines,
  safeHref,
  type CertificationItem,
  type EducationItem,
  type ExperienceItem,
  type Profile,
  type ProjectItem,
  type Resume,
  type SectionId,
  type SkillGroup,
} from "@/lib/resume";

/** Link when the value is a safe URL, plain text otherwise. */
export function MaybeLink({ value, kind = "url", children }: { value: string; kind?: "url" | "email" | "phone"; children?: ReactNode }) {
  const href = safeHref(value, kind);
  const label = children ?? (kind === "url" ? displayUrl(value) : value);
  if (!href) return <span>{label}</span>;
  return (
    <a href={href} target={kind === "url" ? "_blank" : undefined} rel={kind === "url" ? "noopener noreferrer" : undefined} className="hover:underline">
      {label}
    </a>
  );
}

export function contactItems(profile: Profile): ReactNode[] {
  const items: ReactNode[] = [];
  if (profile.email) items.push(<MaybeLink key="email" value={profile.email} kind="email" />);
  if (profile.phone) items.push(<MaybeLink key="phone" value={profile.phone} kind="phone" />);
  if (profile.location) items.push(<span key="location">{profile.location}</span>);
  if (profile.website) items.push(<MaybeLink key="website" value={profile.website} />);
  if (profile.linkedin) items.push(<MaybeLink key="linkedin" value={profile.linkedin} />);
  if (profile.github) items.push(<MaybeLink key="github" value={profile.github} />);
  return items;
}

export function Bullets({ value, className }: { value: string; className?: string }) {
  const items = lines(value);
  if (items.length === 0) return null;
  return (
    <ul className={`mt-1 list-disc space-y-0.5 pl-[1.15em] marker:text-(--accent) ${className ?? ""}`}>
      {items.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

/** Title on the left, dates on the right — shared by entries in all templates. */
export function EntryHead({ title, subtitle, meta, metaSub }: { title: ReactNode; subtitle?: ReactNode; meta?: string; metaSub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="min-w-0">
        <div className="font-semibold text-slate-900">{title}</div>
        {subtitle && <div className="text-slate-700">{subtitle}</div>}
      </div>
      {(meta || metaSub) && (
        <div className="shrink-0 text-right text-[0.92em] text-slate-500">
          {meta && <div>{meta}</div>}
          {metaSub && <div>{metaSub}</div>}
        </div>
      )}
    </div>
  );
}

export function ExperienceEntry({ item }: { item: ExperienceItem }) {
  return (
    <div className="resume-entry">
      <EntryHead title={item.role || "Role"} subtitle={item.company} meta={dateRange(item.start, item.end, item.current)} metaSub={item.location} />
      <Bullets value={item.highlights} />
    </div>
  );
}

export function ProjectEntry({ item }: { item: ProjectItem }) {
  return (
    <div className="resume-entry">
      <div className="flex items-baseline justify-between gap-4">
        <div className="font-semibold text-slate-900">{item.name || "Project"}</div>
        {item.link && (
          <div className="shrink-0 text-[0.92em] text-(--accent)">
            <MaybeLink value={item.link} />
          </div>
        )}
      </div>
      {item.tech && <div className="text-[0.92em] text-slate-500 italic">{item.tech}</div>}
      <Bullets value={item.highlights} />
    </div>
  );
}

export function EducationEntry({ item, stacked = false }: { item: EducationItem; stacked?: boolean }) {
  const range = dateRange(item.start, item.end);
  if (stacked) {
    return (
      <div className="resume-entry">
        <div className="font-semibold text-slate-900">{item.degree || "Degree"}</div>
        {item.school && <div className="text-slate-700">{item.school}</div>}
        <div className="text-[0.92em] text-slate-500">{[range, item.score].filter(Boolean).join(" · ")}</div>
      </div>
    );
  }
  return (
    <div className="resume-entry">
      <EntryHead title={item.degree || "Degree"} subtitle={[item.school, item.score].filter(Boolean).join(" · ")} meta={range} metaSub={item.location} />
    </div>
  );
}

export function SkillsList({ groups, variant = "inline" }: { groups: SkillGroup[]; variant?: "inline" | "chips" }) {
  const filled = groups.filter((g) => g.items.trim() || g.label.trim());
  if (variant === "chips") {
    return (
      <div className="space-y-2">
        {filled.map((g) => (
          <div key={g.id} className="resume-entry">
            {g.label && <div className="mb-1 font-semibold text-slate-900">{g.label}</div>}
            <ul className="flex flex-wrap gap-1">
              {commaList(g.items).map((s) => (
                <li key={s} className="rounded bg-white/80 px-1.5 py-0.5 text-[0.9em] text-slate-700 ring-1 ring-slate-200">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-0.5">
      {filled.map((g) => (
        <div key={g.id} className="resume-entry">
          {g.label && <span className="font-semibold text-slate-900">{g.label}: </span>}
          <span className="text-slate-700">{commaList(g.items).join(", ")}</span>
        </div>
      ))}
    </div>
  );
}

export function CertificationEntry({ item }: { item: CertificationItem }) {
  return (
    <div className="resume-entry flex items-baseline justify-between gap-4">
      <div>
        <span className="font-semibold text-slate-900">{item.name || "Certification"}</span>
        {item.issuer && <span className="text-slate-700"> — {item.issuer}</span>}
      </div>
      {item.year && <div className="shrink-0 text-[0.92em] text-slate-500">{item.year}</div>}
    </div>
  );
}

/** Sections to render, in the user's order, skipping hidden and empty ones. */
export function visibleSections(resume: Resume): SectionId[] {
  return resume.sections.filter((s) => s.visible && hasContent(resume, s.id)).map((s) => s.id);
}

export function sectionBody(resume: Resume, id: SectionId, opts: { stacked?: boolean; chips?: boolean } = {}): ReactNode {
  switch (id) {
    case "summary":
      return <p className="whitespace-pre-line text-slate-700">{resume.summary.trim()}</p>;
    case "experience":
      return resume.experience.map((item) => <ExperienceEntry key={item.id} item={item} />);
    case "projects":
      return resume.projects.map((item) => <ProjectEntry key={item.id} item={item} />);
    case "education":
      return resume.education.map((item) => <EducationEntry key={item.id} item={item} stacked={opts.stacked} />);
    case "skills":
      return <SkillsList groups={resume.skills} variant={opts.chips ? "chips" : "inline"} />;
    case "certifications":
      return resume.certifications.map((item) => <CertificationEntry key={item.id} item={item} />);
  }
}
