import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
      <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
        RC
      </span>
      <span className="text-lg">
        Resume<span className="text-brand-600">Craft</span>
      </span>
    </Link>
  );
}
