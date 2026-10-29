import type { Resume, SectionId } from "@/lib/resume";
import { SECTION_LABELS } from "@/lib/resume";
import { contactItems, sectionBody, visibleSections } from "./parts";

/** Sections drawn as a timeline (one dot per entry, see .timeline in globals.css). */
const TIMELINE_SECTIONS: SectionId[] = ["experience", "education", "projects", "certifications"];

export function Executive({ resume }: { resume: Resume }) {
  const { profile } = resume;
  const contacts = contactItems(profile);
  return (
    <>
      <header className="-mx-(--pad) -mt-(--pad) mb-[calc(var(--gap)*1.4)] border-b-[6px] border-(--accent) bg-slate-900 px-(--pad) pt-[calc(var(--pad)*0.85)] pb-[calc(var(--pad)*0.6)] text-white">
        <h1 className="text-[2.4em] leading-tight font-bold tracking-tight">{profile.name || "Your Name"}</h1>
        {profile.title && <p className="mt-0.5 text-[1.15em] font-medium tracking-wide text-white/80 uppercase">{profile.title}</p>}
        {contacts.length > 0 && <p className="mt-3 flex flex-wrap gap-x-4 gap-y-0.5 text-[0.9em] text-white/75">{contacts}</p>}
      </header>
      {visibleSections(resume).map((id) => (
        <section key={id} className="resume-section mt-[calc(var(--gap)*1.3)] first-of-type:mt-0">
          <h2 className="mb-2 text-[1.05em] font-bold tracking-wider text-slate-900 uppercase">
            {SECTION_LABELS[id]}
            <span aria-hidden className="mt-1 block h-[3px] w-10 rounded-full bg-(--accent)" />
          </h2>
          <div className="space-y-[calc(var(--gap)*0.8)]">{sectionBody(resume, id, { chips: id === "skills" })}</div>
        </section>
      ))}
    </>
  );
}

export function Timeline({ resume }: { resume: Resume }) {
  const { profile } = resume;
  const contacts = contactItems(profile);
  return (
    <>
      <header className="flex items-end justify-between gap-6 border-b border-slate-200 pb-(--gap)">
        <div>
          <h1 className="text-[2.3em] leading-tight font-extrabold tracking-tight text-slate-900">{profile.name || "Your Name"}</h1>
          {profile.title && <p className="mt-0.5 text-[1.12em] font-semibold text-(--accent)">{profile.title}</p>}
        </div>
        {contacts.length > 0 && (
          <ul className="shrink-0 space-y-0.5 text-right text-[0.88em] text-slate-600">
            {contacts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </header>
      {visibleSections(resume).map((id) => (
        <section key={id} className="resume-section mt-[calc(var(--gap)*1.3)]">
          <h2 className="mb-2 flex items-center gap-2 text-[0.98em] font-bold tracking-[0.12em] text-(--accent) uppercase">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-(--accent)" />
            {SECTION_LABELS[id]}
          </h2>
          <div className={TIMELINE_SECTIONS.includes(id) ? "timeline space-y-[calc(var(--gap)*0.9)]" : "space-y-[calc(var(--gap)*0.8)] pl-[18px]"}>
            {sectionBody(resume, id)}
          </div>
        </section>
      ))}
    </>
  );
}
