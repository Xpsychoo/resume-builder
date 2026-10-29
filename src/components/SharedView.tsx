"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { printResume } from "@/lib/print";
import type { Resume } from "@/lib/resume";
import { decodeResume, payloadFromHash } from "@/lib/share";
import { saveResume } from "@/lib/storage";
import { Brand } from "./Brand";
import { DownloadIcon, EditIcon } from "./icons";
import { Preview } from "./Preview";
import { Button } from "./ui";

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; resume: Resume };

/** Read-only view of a resume carried in the URL fragment. Rendered client-side only. */
export default function SharedView() {
  const router = useRouter();
  const [payload] = useState(() => payloadFromHash(window.location.hash));
  const [state, setState] = useState<State>(() => (payload ? { status: "loading" } : { status: "error", message: "This link doesn't contain a resume." }));

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;
    decodeResume(payload)
      .then((resume) => !cancelled && setState({ status: "ready", resume }))
      .catch(() => !cancelled && setState({ status: "error", message: "This share link is broken or incomplete. Ask the sender for a new link." }));
    return () => {
      cancelled = true;
    };
  }, [payload]);

  function editCopy(resume: Resume) {
    if (!window.confirm("Copy this resume into your editor? It will replace the resume saved in this browser.")) return;
    saveResume(resume);
    router.push("/");
  }

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-2.5">
          <Brand />
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Shared resume · read-only</span>
          {state.status === "ready" && (
            <div className="ml-auto flex gap-2">
              <Button onClick={() => editCopy(state.resume)}>
                <EditIcon /> Edit a copy
              </Button>
              <Button variant="primary" onClick={() => printResume(state.resume)}>
                <DownloadIcon /> Download PDF
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className="print-block mx-auto max-w-5xl px-4 py-6">
        {state.status === "loading" && <p className="py-20 text-center text-slate-500">Opening resume…</p>}
        {state.status === "error" && (
          <div className="mx-auto max-w-md py-20 text-center">
            <h1 className="text-xl font-semibold text-slate-900">Can&apos;t open this resume</h1>
            <p className="mt-2 text-slate-600">{state.message}</p>
            <Link href="/" className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Build your own resume
            </Link>
          </div>
        )}
        {state.status === "ready" && (
          <div className="print-area">
            <Preview resume={state.resume} />
          </div>
        )}
      </main>
    </div>
  );
}
