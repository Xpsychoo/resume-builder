"use client";

import dynamic from "next/dynamic";

/**
 * The editor and shared view read browser-only state (localStorage, the URL
 * fragment) while initialising, so they are never server-rendered.
 */
function AppSkeleton() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status">
      <span className="text-sm text-slate-500">Loading editor…</span>
    </div>
  );
}

export const BuilderClient = dynamic(() => import("./Builder"), { ssr: false, loading: AppSkeleton });
export const SharedViewClient = dynamic(() => import("./SharedView"), { ssr: false, loading: AppSkeleton });
