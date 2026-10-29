"use client";

import { useState, type DragEvent } from "react";
import {
  ACCENT_PRESETS,
  moveItem,
  SECTION_LABELS,
  TEMPLATE_LABELS,
  TEMPLATES,
  type Density,
  type FontId,
  type Resume,
  type TemplateId,
} from "@/lib/resume";
import { DownIcon, EyeIcon, EyeOffIcon, GripIcon, UpIcon } from "../icons";
import { cn, IconButton, Panel } from "../ui";
import type { ResumeActions } from "./actions";

/** Tiny schematic of each template layout. */
function TemplateThumb({ id, accent }: { id: TemplateId; accent: string }) {
  const bar = (w: string, extra = "") => <div className={cn("h-1 rounded-full bg-slate-300", extra)} style={{ width: w }} />;
  if (id === "modern") {
    return (
      <div className="flex h-full">
        <div className="w-[36%] space-y-1 p-1.5" style={{ background: `${accent}18` }}>
          <div className="h-1.5 w-4/5 rounded-full" style={{ background: accent }} />
          {bar("70%")}
          {bar("60%")}
        </div>
        <div className="flex-1 space-y-1 p-1.5">
          {bar("50%", "bg-slate-500")}
          {bar("90%")}
          {bar("80%")}
          {bar("50%", "mt-2 bg-slate-500")}
          {bar("85%")}
        </div>
      </div>
    );
  }
  if (id === "minimal") {
    return (
      <div className="space-y-1 p-2">
        <div className="h-1.5 w-1/2 rounded-full" style={{ background: accent }} />
        {bar("35%")}
        <div className="flex gap-1.5 pt-1.5">
          <div className="w-1/4">{bar("100%")}</div>
          <div className="flex-1 space-y-1">
            {bar("90%")}
            {bar("75%")}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1 p-2">
      <div className="mx-auto h-1.5 w-1/2 rounded-full bg-slate-600" />
      <div className="mx-auto h-1 w-1/3 rounded-full" style={{ background: accent }} />
      <div className="h-px w-full" style={{ background: accent }} />
      {bar("40%", "mt-1 bg-slate-500")}
      {bar("95%")}
      {bar("85%")}
    </div>
  );
}

function Choice<T extends string>({ name, value, options, onChange }: { name: string; value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={name} className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-md px-3 py-1.5 text-sm font-medium", value === o.value ? "bg-brand-600 text-white" : "text-slate-600 hover:text-slate-900")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SectionOrder({ resume, actions }: { resume: Resume; actions: ResumeActions }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { sections } = resume;
  const move = (from: number, to: number) => actions.setSections(moveItem(sections, from, to));

  const onDrop = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null) move(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <ul className="space-y-1.5" aria-label="Section order">
      {sections.map((s, index) => (
        <li
          key={s.id}
          draggable
          onDragStart={(e) => {
            setDragIndex(index);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setOverIndex(index);
          }}
          onDragLeave={() => setOverIndex((i) => (i === index ? null : i))}
          onDrop={(e) => onDrop(e, index)}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-white py-1 pr-1 pl-2 text-sm transition-colors",
            overIndex === index && dragIndex !== index ? "border-brand-500 bg-brand-50" : "border-slate-200",
            dragIndex === index && "opacity-50",
            !s.visible && "text-slate-400",
          )}
        >
          <span className="cursor-grab text-slate-400 active:cursor-grabbing" title="Drag to reorder">
            <GripIcon />
          </span>
          <span className={cn("flex-1 font-medium", !s.visible && "line-through")}>{SECTION_LABELS[s.id]}</span>
          <IconButton label={`Move ${SECTION_LABELS[s.id]} up`} disabled={index === 0} onClick={() => move(index, index - 1)}>
            <UpIcon />
          </IconButton>
          <IconButton label={`Move ${SECTION_LABELS[s.id]} down`} disabled={index === sections.length - 1} onClick={() => move(index, index + 1)}>
            <DownIcon />
          </IconButton>
          <IconButton
            label={s.visible ? `Hide ${SECTION_LABELS[s.id]}` : `Show ${SECTION_LABELS[s.id]}`}
            aria-pressed={!s.visible}
            onClick={() => actions.setSections(sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)))}
          >
            {s.visible ? <EyeIcon /> : <EyeOffIcon />}
          </IconButton>
        </li>
      ))}
    </ul>
  );
}

export function DesignEditor({ resume, actions }: { resume: Resume; actions: ResumeActions }) {
  const { settings } = resume;
  return (
    <div className="space-y-4">
      <Panel title="Template" description="Your content stays the same — only the layout changes">
        <div role="radiogroup" aria-label="Template" className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={settings.template === t}
              onClick={() => actions.setSettings({ template: t })}
              className={cn(
                "overflow-hidden rounded-lg border-2 bg-white text-left transition-colors",
                settings.template === t ? "border-brand-600 ring-2 ring-brand-600/20" : "border-slate-200 hover:border-slate-300",
              )}
            >
              <div className="aspect-[3/4] border-b border-slate-100 bg-white">
                <TemplateThumb id={t} accent={settings.accent} />
              </div>
              <div className="px-2 py-1.5 text-center text-xs font-medium text-slate-700">{TEMPLATE_LABELS[t]}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Style">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">Accent colour</p>
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Accent colour">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={settings.accent === c}
                  aria-label={c}
                  onClick={() => actions.setSettings({ accent: c })}
                  className={cn("h-8 w-8 rounded-full ring-offset-2 transition", settings.accent === c ? "ring-2 ring-slate-900" : "hover:scale-110")}
                  style={{ background: c }}
                />
              ))}
              <label className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600">
                <input type="color" value={settings.accent} onChange={(e) => actions.setSettings({ accent: e.target.value })} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0" />
                Custom
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">Font</p>
              <Choice<FontId>
                name="Font"
                value={settings.font}
                onChange={(font) => actions.setSettings({ font })}
                options={[
                  { value: "sans", label: "Sans" },
                  { value: "serif", label: "Serif" },
                ]}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">Spacing</p>
              <Choice<Density>
                name="Spacing"
                value={settings.density}
                onChange={(density) => actions.setSettings({ density })}
                options={[
                  { value: "comfortable", label: "Comfortable" },
                  { value: "compact", label: "Compact" },
                ]}
              />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Sections" description="Drag or use the arrows to reorder; hide what you don't need">
        <SectionOrder resume={resume} actions={actions} />
      </Panel>
    </div>
  );
}
