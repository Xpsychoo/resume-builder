import type { Metadata } from "next";
import { BuilderClient } from "@/components/ClientOnly";
import { getSiteUrl, SITE } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_IN", url: "/", title: SITE.title, description: SITE.description },
};

const FEATURES = [
  { title: "Live A4 preview", text: "See every change instantly, exactly as it will print, with page-break markers." },
  { title: "Seven templates", text: "Oxford, Harvard, Executive, Timeline, Classic, Modern and Minimal — switch any time, with your own accent colour and font." },
  { title: "PDF in one click", text: "Uses your browser's Save as PDF, so text stays selectable and ATS-friendly." },
  { title: "Private share links", text: "Your resume is packed into the link itself. Nothing is uploaded or stored on a server." },
  { title: "Autosave & backups", text: "Work is saved in your browser automatically. Export or import a JSON backup any time." },
  { title: "Free, no sign-up", text: "No account, no watermark, no tracking scripts." },
];

function jsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    url: `${getSiteUrl()}/`,
    description: SITE.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    author: { "@type": "Person", name: "Ajay Kumar" },
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <h1 className="sr-only">{SITE.title}</h1>
      <BuilderClient />
      <section aria-labelledby="features-heading" className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="features-heading" className="text-center text-2xl font-bold text-slate-900">
            A free resume builder that respects your privacy
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center text-xs text-slate-500">Built with Next.js by Ajay Kumar. No external services — everything runs in your browser.</p>
        </div>
      </section>
    </>
  );
}
