# ResumeCraft — Resume Builder with Live Preview

A free, privacy-first resume builder. Edit on the left, see an exact A4 preview on the right, download a PDF in one click, and share a read-only link — **with no backend, database or third-party services**. Built with Next.js only and deployable on Vercel's free tier.

## Features

- **Live A4 preview** that scales to the screen, with markers showing where printed pages break
- **Seven templates**, each previewed live in the picker:
  - **Oxford**: traditional British/academic CV with small-caps headings and dates in the margin
  - **Harvard**: the classic US career-office format, monochrome and very ATS-friendly
  - **Executive**: dark header band for senior roles
  - **Timeline**: experience and education along a vertical timeline
  - **Classic**, **Modern** (tinted sidebar) and **Minimal**
- Accent colour, sans/serif font and compact spacing (Oxford and Harvard switch to serif automatically)
- **Sections:** personal details, summary, experience, projects, education, skills, certifications — reorder them by drag and drop or arrow buttons, and hide the ones you don't need
- **PDF download** through the browser's print dialog, so text stays selectable (ATS-friendly) and the file is named after you
- **Private share links:** the resume is compressed (`CompressionStream`) into the URL fragment (`/view#r=…`). Fragments are never sent to the server, so nothing is stored online
- **Autosave** to `localStorage`, plus JSON **export/import** for backups
- **Responsive:** Edit/Preview switch on phones
- **SEO:** metadata, Open Graph image, sitemap, robots, web manifest and `WebApplication` structured data. Shared resumes are `noindex`

## Security & privacy

- All imported, saved and shared data goes through `normalizeResume()`, which enforces the shape, field lengths and list sizes and drops unknown values
- Links in a resume are only rendered as `http(s)`, `mailto:` or `tel:` — `javascript:` and `data:` URLs in a crafted share link are shown as plain text
- Share-link decoding stops at 256 KB of decompressed data, so a malicious link can't exhaust memory
- Strict security headers and a Content-Security-Policy that allows no third-party origins

## Tech

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Vitest + Testing Library. Runtime dependencies: `next`, `react`, `react-dom` — nothing else.

## Run locally

Requires Node.js 22.12+ and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm test` | Unit and component tests |
| `pnpm check` | Lint + typecheck + tests |
| `pnpm build` | Production build (every page is static) |

## Deploy to Vercel

Import the repository in Vercel and keep the defaults (Framework: Next.js). Optionally set `NEXT_PUBLIC_SITE_URL` to your production URL for canonical links and social cards, and `GOOGLE_SITE_VERIFICATION` for Search Console.

## Project structure

```
src/
  app/                 Pages, metadata, icons, OG image, sitemap, robots
  components/
    Builder.tsx        Editor shell: state, autosave, import/export, share, print
    SharedView.tsx     Read-only /view page
    Preview.tsx        Scaled A4 preview with page-break markers
    editor/            Content and design editors
    templates/         The seven resume templates
  lib/
    resume.ts          Data model, sample data, normalisation, safe links
    share.ts           Share-link encoding/decoding
    storage.ts         localStorage and JSON backup
test/                  Vitest suites
```
