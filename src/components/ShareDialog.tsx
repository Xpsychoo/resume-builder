"use client";

import { useEffect, useRef, useState } from "react";
import type { Resume } from "@/lib/resume";
import { encodeResume, shareUrl } from "@/lib/share";
import { CheckIcon, CloseIcon, CopyIcon } from "./icons";
import { Button, IconButton } from "./ui";

/** Mounted only while open, so each opening builds a fresh link. */
export function ShareDialog({ resume, onClose }: { resume: Resume; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
    let cancelled = false;
    encodeResume(resume)
      .then((payload) => !cancelled && setLink(shareUrl(window.location.origin, payload)))
      .catch(() => !cancelled && setError("Your browser couldn't create a share link."));
    return () => {
      cancelled = true;
    };
  }, [resume]);

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically — select the link and copy it.");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(92vw,560px)] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/50"
      aria-labelledby="share-title"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="share-title" className="text-lg font-semibold text-slate-900">
              Share your resume
            </h2>
            <p className="mt-1 text-sm text-slate-600">Anyone with this link can view and download your resume.</p>
          </div>
          <IconButton label="Close" onClick={() => ref.current?.close()}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            readOnly
            aria-label="Share link"
            value={link ?? (error ? "" : "Creating link…")}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
          />
          <Button variant="primary" onClick={copy} disabled={!link}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-4 rounded-lg bg-brand-50 p-3 text-xs leading-relaxed text-brand-900">
          <strong>Private by design:</strong> your resume is compressed into the link itself (after the <code>#</code>), which browsers never send to the
          server. Nothing is stored online — if you edit your resume later, create a new link.
        </div>
      </div>
    </dialog>
  );
}
