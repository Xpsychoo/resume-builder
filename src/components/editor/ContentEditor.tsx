"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { LIMITS, type ListKey, type Profile, type Resume } from "@/lib/resume";
import { DownIcon, PlusIcon, TrashIcon, UpIcon } from "../icons";
import { Button, IconButton, Panel, TextArea, TextField } from "../ui";
import type { ListItem, ResumeActions } from "./actions";

const PROFILE_FIELDS: Array<{ field: keyof Profile; label: string; placeholder: string; type?: string }> = [
  { field: "name", label: "Full name", placeholder: "Aarav Mehta" },
  { field: "title", label: "Job title", placeholder: "Frontend Developer" },
  { field: "email", label: "Email", placeholder: "you@example.com", type: "email" },
  { field: "phone", label: "Phone", placeholder: "+91 98765 43210", type: "tel" },
  { field: "location", label: "Location", placeholder: "Jaipur, India" },
  { field: "website", label: "Website / portfolio", placeholder: "yourname.dev" },
  { field: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you" },
  { field: "github", label: "GitHub", placeholder: "github.com/you" },
];

const BULLET_HINT = "One point per line. Start with a verb and add numbers where you can.";

function isBlank(item: object): boolean {
  return Object.entries(item).every(([k, v]) => k === "id" || v === "" || v === false);
}

/** Buttons inside <summary> must not toggle the <details>. */
const inSummary = (fn: () => void) => (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  fn();
};

function ListItemCard({
  title,
  index,
  count,
  startOpen,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  startOpen: boolean;
  onMove: (to: number) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  // Only the initial state is controlled, so typing never collapses the card.
  const [open] = useState(startOpen);
  return (
    <details open={open} className="group/item rounded-lg border border-slate-200 bg-slate-50/60">
      <summary className="flex cursor-pointer list-none items-center gap-2 py-1.5 pr-1.5 pl-3 select-none [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="text-xs text-slate-400 transition-transform group-open/item:rotate-90">
          ▸
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{title}</span>
        <IconButton label="Move up" disabled={index === 0} onClick={inSummary(() => onMove(index - 1))}>
          <UpIcon />
        </IconButton>
        <IconButton label="Move down" disabled={index === count - 1} onClick={inSummary(() => onMove(index + 1))}>
          <DownIcon />
        </IconButton>
        <IconButton label="Remove" className="hover:bg-rose-50 hover:text-rose-600" onClick={inSummary(onRemove)}>
          <TrashIcon />
        </IconButton>
      </summary>
      <div className="grid gap-3 border-t border-slate-200 p-3 sm:grid-cols-2">{children}</div>
    </details>
  );
}

function ListEditor<K extends ListKey>({
  listKey,
  resume,
  actions,
  title,
  description,
  addLabel,
  itemTitle,
  renderFields,
}: {
  listKey: K;
  resume: Resume;
  actions: ResumeActions;
  title: string;
  description: string;
  addLabel: string;
  itemTitle: (item: ListItem<K>) => string;
  renderFields: (item: ListItem<K>, update: (patch: Partial<ListItem<K>>) => void) => ReactNode;
}) {
  const items = resume[listKey] as Array<ListItem<K>>;
  const full = items.length >= LIMITS.items;
  return (
    <Panel title={title} description={description}>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-slate-500">Nothing here yet.</p>}
        {items.map((item, index) => (
          <ListItemCard
            key={item.id}
            title={itemTitle(item)}
            index={index}
            count={items.length}
            startOpen={isBlank(item)}
            onMove={(to) => actions.moveItem(listKey, index, to)}
            onRemove={() => {
              if (isBlank(item) || window.confirm(`Remove “${itemTitle(item)}”?`)) actions.removeItem(listKey, item.id);
            }}
          >
            {renderFields(item, (patch) => actions.updateItem(listKey, item.id, patch))}
          </ListItemCard>
        ))}
        <Button variant="ghost" className="w-full border border-dashed border-slate-300" disabled={full} onClick={() => actions.addItem(listKey)}>
          <PlusIcon /> {full ? `Limit of ${LIMITS.items} reached` : addLabel}
        </Button>
      </div>
    </Panel>
  );
}

export function ContentEditor({ resume, actions }: { resume: Resume; actions: ResumeActions }) {
  const short = LIMITS.shortText;
  return (
    <div className="space-y-4">
      <Panel title="Personal details" description="Name, title and how to reach you">
        <div className="grid gap-3 sm:grid-cols-2">
          {PROFILE_FIELDS.map(({ field, label, placeholder, type }) => (
            <TextField
              key={field}
              label={label}
              placeholder={placeholder}
              type={type ?? "text"}
              maxLength={field === "website" || field === "linkedin" || field === "github" ? 200 : short}
              value={resume.profile[field]}
              onChange={(e) => actions.setProfile(field, e.target.value)}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Summary" description="2–3 lines about who you are and what you do best">
        <TextArea
          label="Professional summary"
          placeholder="Frontend developer with 3+ years of experience…"
          maxLength={LIMITS.longText}
          value={resume.summary}
          onChange={(e) => actions.setSummary(e.target.value)}
        />
      </Panel>

      <ListEditor
        listKey="experience"
        resume={resume}
        actions={actions}
        title="Experience"
        description="Most recent first"
        addLabel="Add experience"
        itemTitle={(i) => [i.role, i.company].filter(Boolean).join(" · ") || "New experience"}
        renderFields={(item, update) => (
          <>
            <TextField label="Role" maxLength={short} value={item.role} onChange={(e) => update({ role: e.target.value })} />
            <TextField label="Company" maxLength={short} value={item.company} onChange={(e) => update({ company: e.target.value })} />
            <TextField label="Start" placeholder="Jan 2023" maxLength={short} value={item.start} onChange={(e) => update({ start: e.target.value })} />
            <TextField label="End" placeholder="Dec 2024" maxLength={short} disabled={item.current} value={item.current ? "" : item.end} onChange={(e) => update({ end: e.target.value })} />
            <TextField label="Location" maxLength={short} value={item.location} onChange={(e) => update({ location: e.target.value })} />
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={item.current} onChange={(e) => update({ current: e.target.checked })} />
              I currently work here
            </label>
            <TextArea
              label="Highlights"
              hint={BULLET_HINT}
              className="sm:col-span-2"
              maxLength={LIMITS.longText}
              value={item.highlights}
              onChange={(e) => update({ highlights: e.target.value })}
            />
          </>
        )}
      />

      <ListEditor
        listKey="projects"
        resume={resume}
        actions={actions}
        title="Projects"
        description="Personal or professional projects worth showing"
        addLabel="Add project"
        itemTitle={(i) => i.name || "New project"}
        renderFields={(item, update) => (
          <>
            <TextField label="Project name" maxLength={short} value={item.name} onChange={(e) => update({ name: e.target.value })} />
            <TextField label="Link" placeholder="github.com/you/project" maxLength={200} value={item.link} onChange={(e) => update({ link: e.target.value })} />
            <TextField label="Tech used" placeholder="Next.js, TypeScript" className="sm:col-span-2" maxLength={300} value={item.tech} onChange={(e) => update({ tech: e.target.value })} />
            <TextArea label="Highlights" hint={BULLET_HINT} className="sm:col-span-2" maxLength={LIMITS.longText} value={item.highlights} onChange={(e) => update({ highlights: e.target.value })} />
          </>
        )}
      />

      <ListEditor
        listKey="education"
        resume={resume}
        actions={actions}
        title="Education"
        description="Degrees, diplomas and schooling"
        addLabel="Add education"
        itemTitle={(i) => [i.degree, i.school].filter(Boolean).join(" · ") || "New education"}
        renderFields={(item, update) => (
          <>
            <TextField label="Degree / course" maxLength={short} value={item.degree} onChange={(e) => update({ degree: e.target.value })} />
            <TextField label="School / university" maxLength={short} value={item.school} onChange={(e) => update({ school: e.target.value })} />
            <TextField label="Start" placeholder="2017" maxLength={short} value={item.start} onChange={(e) => update({ start: e.target.value })} />
            <TextField label="End" placeholder="2021" maxLength={short} value={item.end} onChange={(e) => update({ end: e.target.value })} />
            <TextField label="Location" maxLength={short} value={item.location} onChange={(e) => update({ location: e.target.value })} />
            <TextField label="Score" placeholder="CGPA 8.1 / 85%" maxLength={short} value={item.score} onChange={(e) => update({ score: e.target.value })} />
          </>
        )}
      />

      <ListEditor
        listKey="skills"
        resume={resume}
        actions={actions}
        title="Skills"
        description="Group related skills, e.g. Frontend, Tools, Languages"
        addLabel="Add skill group"
        itemTitle={(i) => i.label || i.items.slice(0, 40) || "New skill group"}
        renderFields={(item, update) => (
          <>
            <TextField label="Group name" placeholder="Frontend" maxLength={short} value={item.label} onChange={(e) => update({ label: e.target.value })} />
            <TextField label="Skills" placeholder="React, Next.js, TypeScript" hint="Separate with commas" maxLength={600} value={item.items} onChange={(e) => update({ items: e.target.value })} />
          </>
        )}
      />

      <ListEditor
        listKey="certifications"
        resume={resume}
        actions={actions}
        title="Certifications"
        description="Courses, licences and awards"
        addLabel="Add certification"
        itemTitle={(i) => i.name || "New certification"}
        renderFields={(item, update) => (
          <>
            <TextField label="Name" className="sm:col-span-2" maxLength={short} value={item.name} onChange={(e) => update({ name: e.target.value })} />
            <TextField label="Issuer" maxLength={short} value={item.issuer} onChange={(e) => update({ issuer: e.target.value })} />
            <TextField label="Year" maxLength={short} value={item.year} onChange={(e) => update({ year: e.target.value })} />
          </>
        )}
      />
    </div>
  );
}
