"use client";

import { useEffect, useRef, useState } from "react";
import type { Resume } from "@/lib/resume";
import { PAGE_HEIGHT, PAGE_WIDTH, ResumeDocument } from "./templates/ResumeDocument";

/**
 * Scales the fixed-size A4 document to fit its container and marks where
 * printed pages will break. Printing ignores the scaling (see globals.css).
 */
export function Preview({ resume }: { resume: Resume }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [docHeight, setDocHeight] = useState(PAGE_HEIGHT);

  useEffect(() => {
    const frame = frameRef.current;
    const doc = docRef.current;
    if (!frame || !doc) return;
    const observer = new ResizeObserver(() => {
      setScale(Math.min(1, frame.clientWidth / PAGE_WIDTH));
      setDocHeight(doc.offsetHeight);
    });
    observer.observe(frame);
    observer.observe(doc);
    return () => observer.disconnect();
  }, []);

  const pages = Math.max(1, Math.ceil((docHeight - 2) / PAGE_HEIGHT));

  return (
    <div ref={frameRef} className="preview-frame w-full">
      <div className="preview-sizer relative mx-auto" style={{ width: PAGE_WIDTH * scale, height: docHeight * scale }}>
        <div ref={docRef} className="preview-scaler absolute top-0 left-0 origin-top-left shadow-xl ring-1 ring-slate-200" style={{ transform: `scale(${scale})` }}>
          <ResumeDocument resume={resume} />
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div
              key={i}
              aria-hidden
              className="page-break-guide pointer-events-none absolute right-0 left-0 border-t-2 border-dashed border-rose-300"
              style={{ top: PAGE_HEIGHT * (i + 1) }}
            >
              <span className="absolute -top-3 right-2 rounded bg-rose-100 px-1.5 text-[11px] font-medium text-rose-700">Page {i + 2}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="no-print mt-3 text-center text-xs text-slate-500">
        {pages === 1 ? "Fits on 1 page" : `${pages} pages — dashed lines show where pages break`}
      </p>
    </div>
  );
}
