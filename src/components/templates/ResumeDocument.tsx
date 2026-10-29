import { Fragment, type CSSProperties } from "react";
import { SECTION_LABELS, type Resume, type SectionId } from "@/lib/resume";
import { contactItems, sectionBody, visibleSections } from "./parts";
import { Executive, Timeline } from "./styled";
import { Harvard, Oxford } from "./traditional";

/** A4 at 96 dpi. Print CSS switches the page to real millimetres. */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

const FONT_STACKS = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", "Noto Serif", serif',
} as const;

/** Sections the Modern template shows in its sidebar. */
const SIDEBAR_SECTIONS: SectionId[] = ["skills", "education", "certifications"];

function Classic({ resume }: { resume: Resume }) {
  const { profile } = resume;
  const contacts = contactItems(profile);
  return (
    <>
      <header className="border-b-2 border-(--accent) pb-(--gap) text-center">
        <h1 className="text-[2.3em] leading-tight font-bold tracking-tight text-slate-900">{profile.name || "Your Name"}</h1>
        {profile.title && <p className="mt-0.5 text-[1.15em] font-medium text-(--accent)">{profile.title}</p>}
        {contacts.length > 0 && (
          <p className="mt-2 flex flex-wrap justify-center gap-x-2 text-[0.92em] text-slate-600">
            {contacts.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && <span aria-hidden className="text-slate-300">|</span>}
                {c}
              </Fragment>
            ))}
          </p>
        )}
      </header>
      {visibleSections(resume).map((id) => (
        <section key={id} className="resume-section mt-(--gap)">
          <h2 className="mb-1.5 border-b border-slate-200 pb-0.5 text-[0.95em] font-bold tracking-[0.12em] text-(--accent) uppercase">{SECTION_LABELS[id]}</h2>
          <div className="space-y-[calc(var(--gap)*0.7)]">{sectionBody(resume, id)}</div>
        </section>
      ))}
    </>
  );
}

function Modern({ resume }: { resume: Resume }) {
  const { profile } = resume;
  const sections = visibleSections(resume);
  const side = sections.filter((s) => SIDEBAR_SECTIONS.includes(s));
  const main = sections.filter((s) => !SIDEBAR_SECTIONS.includes(s));
  const contacts = contactItems(profile);
  return (
    <div className="-m-(--pad) grid min-h-[inherit] grid-cols-[34%_1fr]">
      <aside className="resume-sidebar bg-(--accent)/8 p-(--pad) pr-[calc(var(--pad)*0.6)]">
        <h1 className="text-[2em] leading-tight font-bold text-slate-900">{profile.name || "Your Name"}</h1>
        {profile.title && <p className="mt-1 font-medium text-(--accent)">{profile.title}</p>}
        {contacts.length > 0 && (
          <ul className="mt-(--gap) space-y-1 text-[0.92em] wrap-break-word text-slate-700">
            {contacts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
        {side.map((id) => (
          <section key={id} className="resume-section mt-[calc(var(--gap)*1.4)]">
            <h2 className="mb-1.5 text-[0.9em] font-bold tracking-[0.14em] text-(--accent) uppercase">{SECTION_LABELS[id]}</h2>
            <div className="space-y-[calc(var(--gap)*0.6)]">{sectionBody(resume, id, { stacked: true, chips: true })}</div>
          </section>
        ))}
      </aside>
      <div className="p-(--pad) pl-[calc(var(--pad)*0.7)]">
        {main.map((id, i) => (
          <section key={id} className={`resume-section ${i > 0 ? "mt-[calc(var(--gap)*1.4)]" : ""}`}>
            <h2 className="mb-2 flex items-center gap-2 text-[1.05em] font-bold text-slate-900">
              <span aria-hidden className="h-4 w-1 rounded-full bg-(--accent)" />
              {SECTION_LABELS[id]}
            </h2>
            <div className="space-y-[calc(var(--gap)*0.8)]">{sectionBody(resume, id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Minimal({ resume }: { resume: Resume }) {
  const { profile } = resume;
  const contacts = contactItems(profile);
  return (
    <>
      <header>
        <h1 className="text-[2.5em] leading-none font-light tracking-tight text-(--accent)">{profile.name || "Your Name"}</h1>
        {profile.title && <p className="mt-2 text-[1.1em] text-slate-600">{profile.title}</p>}
        {contacts.length > 0 && <p className="mt-2 flex flex-wrap gap-x-4 text-[0.9em] text-slate-500">{contacts}</p>}
      </header>
      {visibleSections(resume).map((id) => (
        <section key={id} className="resume-section mt-[calc(var(--gap)*1.5)] grid grid-cols-[22%_1fr] gap-4">
          <h2 className="pt-0.5 text-[0.82em] font-semibold tracking-[0.16em] text-slate-400 uppercase">{SECTION_LABELS[id]}</h2>
          <div className="space-y-[calc(var(--gap)*0.8)]">{sectionBody(resume, id)}</div>
        </section>
      ))}
    </>
  );
}

const TEMPLATE_COMPONENTS = { classic: Classic, modern: Modern, minimal: Minimal, oxford: Oxford, harvard: Harvard, executive: Executive, timeline: Timeline } as const;

export function ResumeDocument({ resume }: { resume: Resume }) {
  const { settings } = resume;
  const compact = settings.density === "compact";
  const Template = TEMPLATE_COMPONENTS[settings.template];
  const style = {
    "--accent": settings.accent,
    "--pad": compact ? "36px" : "48px",
    "--gap": compact ? "10px" : "14px",
    width: PAGE_WIDTH,
    minHeight: PAGE_HEIGHT,
    padding: "var(--pad)",
    fontFamily: FONT_STACKS[settings.font],
    fontSize: compact ? 12 : 13,
    lineHeight: 1.45,
  } as CSSProperties;
  return (
    <article className="resume-page bg-white text-slate-800" style={style} aria-label={`Resume of ${resume.profile.name || "unnamed"}`}>
      <Template resume={resume} />
    </article>
  );
}
