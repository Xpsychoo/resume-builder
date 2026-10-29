"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { printResume } from "@/lib/print";
import { emptyItem, emptyResume, moveItem, normalizeResume, sampleResume, type ListKey, type Resume } from "@/lib/resume";
import { downloadJson, fileNameFor, loadResume, saveResume } from "@/lib/storage";
import { ContentEditor } from "./editor/ContentEditor";
import { DesignEditor } from "./editor/DesignEditor";
import type { ResumeActions } from "./editor/actions";
import { DocIcon, DownloadIcon, EditIcon, EyeIcon, ResetIcon, ShareIcon, SparkIcon, UploadIcon } from "./icons";
import { Preview } from "./Preview";
import { ShareDialog } from "./ShareDialog";
import { Brand } from "./Brand";
import { Button, cn } from "./ui";

type Tab = "content" | "design";

export default function Builder() {
  // Rendered client-side only (see BuilderClient), so storage can be read during init.
  const [resume, setResume] = useState<Resume>(loadResume);
  const [tab, setTab] = useState<Tab>("content");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [sharing, setSharing] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Debounced autosave.
  useEffect(() => {
    const t = setTimeout(() => setSaveFailed(!saveResume(resume)), 400);
    return () => clearTimeout(t);
  }, [resume]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const actions = useMemo<ResumeActions>(() => {
    const updateList = <K extends ListKey>(key: K, fn: (items: Resume[K]) => Resume[K]) => setResume((r) => ({ ...r, [key]: fn(r[key]) }));
    return {
      setProfile: (field, value) => setResume((r) => ({ ...r, profile: { ...r.profile, [field]: value } })),
      setSummary: (summary) => setResume((r) => ({ ...r, summary })),
      addItem: (key) => updateList(key, (items) => [...items, emptyItem[key]()] as typeof items),
      updateItem: (key, id, patch) => updateList(key, (items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)) as typeof items),
      removeItem: (key, id) => updateList(key, (items) => items.filter((item) => item.id !== id) as typeof items),
      moveItem: (key, from, to) => updateList(key, (items) => moveItem(items as Array<(typeof items)[number]>, from, to) as typeof items),
      setSections: (sections) => setResume((r) => ({ ...r, sections })),
      setSettings: (patch) => setResume((r) => ({ ...r, settings: { ...r.settings, ...patch } })),
    };
  }, []);

  function replaceResume(next: Resume, message: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setResume(next);
    setNotice(message);
  }

  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 512 * 1024) {
      setNotice("That file is too large to be a resume export.");
      return;
    }
    try {
      const imported = normalizeResume(JSON.parse(await file.text()));
      replaceResume(imported, "Resume imported.", "Replace your current resume with the imported file?");
    } catch {
      setNotice("Couldn't read that file. Choose a JSON file exported from ResumeCraft.");
    }
  }

  const secondaryActions = (
    <>
      <Button variant="ghost" className="justify-start" onClick={() => replaceResume(sampleResume(), "Sample loaded.", "Replace your resume with the sample?")} title="Load sample content">
        <SparkIcon /> Sample
      </Button>
      <Button variant="ghost" className="justify-start" onClick={() => replaceResume(emptyResume(), "Started a blank resume.", "Clear everything and start from scratch?")} title="Start from scratch">
        <ResetIcon /> Clear
      </Button>
      <Button variant="ghost" className="justify-start" onClick={() => fileInput.current?.click()} title="Import a JSON backup">
        <UploadIcon /> Import
      </Button>
      <Button variant="ghost" className="justify-start" onClick={() => downloadJson(resume, fileNameFor(resume, "json"))} title="Download a JSON backup">
        <DocIcon /> Export
      </Button>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print z-20 border-b border-slate-200 bg-white/90 backdrop-blur lg:sticky lg:top-0">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2.5">
          <Brand />
          <span className="ml-1 hidden text-xs text-slate-500 sm:inline">{saveFailed ? "⚠ Not saved — browser storage is blocked" : "Saved in this browser"}</span>
          <div className="ml-auto flex items-center gap-1.5">
            {/* Secondary actions: inline on wide screens, in a "More" menu on small ones. */}
            <div className="hidden items-center gap-1.5 md:flex">{secondaryActions}</div>
            <details className="relative md:hidden">
              <summary className="inline-flex cursor-pointer list-none items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
                More
              </summary>
              <div className="absolute right-0 z-30 mt-1 flex w-44 flex-col rounded-xl border border-slate-200 bg-white p-1 shadow-lg">{secondaryActions}</div>
            </details>
            <Button onClick={() => setSharing(true)} aria-label="Share">
              <ShareIcon /> <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="primary" onClick={() => printResume(resume)}>
              <DownloadIcon /> <span className="hidden sm:inline">Download</span> PDF
            </Button>
          </div>
          <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={onImport} aria-label="Import resume JSON" />
        </div>
      </header>

      {/* Mobile switch between editor and preview */}
      <div className="no-print sticky top-0 z-10 flex gap-1 border-b border-slate-200 bg-white p-1.5 lg:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setMobileView(v)}
            aria-pressed={mobileView === v}
            className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium", mobileView === v ? "bg-brand-600 text-white" : "text-slate-600")}
          >
            {v === "edit" ? <EditIcon /> : <EyeIcon />} {v === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="print-block mx-auto grid w-full max-w-[1600px] flex-1 gap-6 px-4 py-5 lg:grid-cols-[minmax(380px,560px)_1fr]">
        <section aria-label="Editor" className={cn("no-print min-w-0", mobileView === "preview" && "hidden lg:block")}>
          <div role="tablist" aria-label="Editor mode" className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1">
            {(["content", "design"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn("rounded-lg py-2 text-sm font-semibold capitalize", tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "content" ? <ContentEditor resume={resume} actions={actions} /> : <DesignEditor resume={resume} actions={actions} />}
        </section>

        <section aria-label="Preview" className={cn("print-area min-w-0", mobileView === "edit" && "hidden lg:block")}>
          <div className="lg:sticky lg:top-20">
            <Preview resume={resume} />
          </div>
        </section>
      </div>

      {notice && (
        <div role="status" className="no-print fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {notice}
        </div>
      )}
      {sharing && <ShareDialog resume={resume} onClose={() => setSharing(false)} />}
    </div>
  );
}
