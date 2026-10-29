import { Fragment, type CSSProperties, type ReactNode } from "react";
import { commaList, dateRange, SECTION_LABELS, type Resume, type SectionId } from "@/lib/resume";
import { Bullets, contactItems, MaybeLink, visibleSections } from "./parts";

/**
 * Black-and-white templates modelled on the formats university career
 * services recommend. They use plain structure (no columns of colour), which
 * applicant tracking systems parse reliably.
 */

/** These formats are traditionally monochrome, so the accent colour is overridden. */
const INK = { "--accent": "#1e293b" } as CSSProperties;

function Contacts({ resume, separator }: { resume: Resume; separator: string }) {
  const contacts = contactItems(resume.profile);
  if (contacts.length === 0) return null;
  return (
    <p className="mt-1.5 flex flex-wrap justify-center gap-x-2 text-[0.92em] text-slate-700">
      {contacts.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden>{separator}</span>}
          {c}
        </Fragment>
      ))}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Oxford: dates in a left-hand margin column, small-caps headings.
// ---------------------------------------------------------------------------

function MarginRow({ margin, children }: { margin?: ReactNode; children: ReactNode }) {
  return (
    <div className="resume-entry grid grid-cols-[23%_1fr] gap-4">
      <div className="text-[0.92em] text-slate-600">{margin}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function oxfordBody(resume: Resume, id: SectionId): ReactNode {
  switch (id) {
    case "summary":
      return <p className="whitespace-pre-line">{resume.summary.trim()}</p>;
    case "experience":
      return resume.experience.map((e) => (
        <MarginRow
          key={e.id}
          margin={
            <>
              <div>{dateRange(e.start, e.end, e.current)}</div>
              {e.location && <div className="italic">{e.location}</div>}
            </>
          }
        >
          <div className="font-bold text-slate-900">{e.company || e.role || "Organisation"}</div>
          {e.company && e.role && <div className="italic">{e.role}</div>}
          <Bullets value={e.highlights} />
        </MarginRow>
      ));
    case "education":
      return resume.education.map((e) => (
        <MarginRow
          key={e.id}
          margin={
            <>
              <div>{dateRange(e.start, e.end)}</div>
              {e.location && <div className="italic">{e.location}</div>}
            </>
          }
        >
          <div className="font-bold text-slate-900">{e.school || e.degree || "Institution"}</div>
          {e.school && e.degree && <div className="italic">{e.degree}</div>}
          {e.score && <div>{e.score}</div>}
        </MarginRow>
      ));
    case "projects":
      return resume.projects.map((p) => (
        <MarginRow key={p.id} margin={p.link ? <MaybeLink value={p.link} /> : undefined}>
          <div className="font-bold text-slate-900">{p.name || "Project"}</div>
          {p.tech && <div className="italic">{p.tech}</div>}
          <Bullets value={p.highlights} />
        </MarginRow>
      ));
    case "skills":
      return resume.skills
        .filter((g) => g.items.trim() || g.label.trim())
        .map((g) => (
          <MarginRow key={g.id} margin={<span className="font-semibold text-slate-800">{g.label}</span>}>
            {commaList(g.items).join(", ")}
          </MarginRow>
        ));
    case "certifications":
      return resume.certifications.map((c) => (
        <MarginRow key={c.id} margin={c.year}>
          <span className="font-semibold text-slate-900">{c.name || "Certification"}</span>
          {c.issuer && <span>, {c.issuer}</span>}
        </MarginRow>
      ));
  }
}

export function Oxford({ resume }: { resume: Resume }) {
  const { profile } = resume;
  return (
    <div className="text-slate-800" style={INK}>
      <header className="border-b-[3px] border-double border-slate-800 pb-(--gap) text-center">
        <h1 className="text-[2.2em] leading-tight font-semibold tracking-wide text-slate-900 [font-variant:small-caps]">{profile.name || "Your Name"}</h1>
        {profile.title && <p className="mt-0.5 text-[1.05em] italic">{profile.title}</p>}
        <Contacts resume={resume} separator="•" />
      </header>
      {visibleSections(resume).map((id) => (
        <section key={id} className="resume-section mt-[calc(var(--gap)*1.2)]">
          <h2 className="mb-2 border-b border-slate-400 pb-0.5 text-[1.12em] font-semibold tracking-wider text-slate-900 [font-variant:small-caps]">{SECTION_LABELS[id]}</h2>
          <div className="space-y-[calc(var(--gap)*0.75)]">{oxfordBody(resume, id)}</div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Harvard: organisation and location on one line, role and dates below.
// ---------------------------------------------------------------------------

function TwoLine({ left, right, italic = false }: { left: ReactNode; right?: ReactNode; italic?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${italic ? "italic" : ""}`}>
      <div className="min-w-0">{left}</div>
      {right && <div className="shrink-0 text-right">{right}</div>}
    </div>
  );
}

function harvardBody(resume: Resume, id: SectionId): ReactNode {
  switch (id) {
    case "summary":
      return <p className="whitespace-pre-line">{resume.summary.trim()}</p>;
    case "experience":
      return resume.experience.map((e) => {
        const role = e.company ? e.role : "";
        const range = dateRange(e.start, e.end, e.current);
        return (
          <div key={e.id} className="resume-entry">
            <TwoLine left={<span className="font-bold text-slate-900">{e.company || e.role || "Organisation"}</span>} right={e.location} />
            {(role || range) && <TwoLine italic left={role} right={range} />}
            <Bullets value={e.highlights} />
          </div>
        );
      });
    case "education":
      return resume.education.map((e) => (
        <div key={e.id} className="resume-entry">
          <TwoLine left={<span className="font-bold text-slate-900">{e.school || e.degree || "Institution"}</span>} right={e.location} />
          <TwoLine italic left={[e.school ? e.degree : "", e.score].filter(Boolean).join(" · ")} right={dateRange(e.start, e.end)} />
        </div>
      ));
    case "projects":
      return resume.projects.map((p) => (
        <div key={p.id} className="resume-entry">
          <TwoLine left={<span className="font-bold text-slate-900">{p.name || "Project"}</span>} right={p.link ? <MaybeLink value={p.link} /> : undefined} />
          {p.tech && <div className="italic">{p.tech}</div>}
          <Bullets value={p.highlights} />
        </div>
      ));
    case "skills":
      return resume.skills
        .filter((g) => g.items.trim() || g.label.trim())
        .map((g) => (
          <div key={g.id} className="resume-entry">
            {g.label && <span className="font-bold text-slate-900">{g.label}: </span>}
            {commaList(g.items).join(", ")}
          </div>
        ));
    case "certifications":
      return resume.certifications.map((c) => (
        <div key={c.id} className="resume-entry">
          <TwoLine
            left={
              <>
                <span className="font-bold text-slate-900">{c.name || "Certification"}</span>
                {c.issuer && <span>, {c.issuer}</span>}
              </>
            }
            right={c.year}
          />
        </div>
      ));
  }
}

export function Harvard({ resume }: { resume: Resume }) {
  const { profile } = resume;
  return (
    <div className="text-slate-800" style={INK}>
      <header className="text-center">
        <h1 className="text-[2em] leading-tight font-bold text-slate-900">{profile.name || "Your Name"}</h1>
        {profile.title && <p className="text-[1.02em]">{profile.title}</p>}
        <Contacts resume={resume} separator="·" />
      </header>
      {visibleSections(resume).map((id) => (
        <section key={id} className="resume-section mt-(--gap)">
          <h2 className="mb-1.5 border-b border-slate-900 text-[1.02em] font-bold tracking-wide text-slate-900 uppercase">{SECTION_LABELS[id]}</h2>
          <div className="space-y-[calc(var(--gap)*0.6)]">{harvardBody(resume, id)}</div>
        </section>
      ))}
    </div>
  );
}
