# NOG Lab — Claude Code Project Rules

This file is the single source of truth for every Claude session in this repo.
Read it in full before touching any code.

---

## Stack & Versions

| Layer     | Choice                                                               | Version |
| --------- | -------------------------------------------------------------------- | ------- |
| Framework | Next.js (App Router, TypeScript strict, Turbopack)                   | 16.x    |
| CMS       | Payload CMS (embedded in /app)                                       | 3.x     |
| Database  | PostgreSQL + PostGIS, Drizzle via Payload's Postgres adapter         | —       |
| Styling   | Tailwind CSS v4                                                      | 4.x     |
| Theme     | next-themes (`data-theme` attribute, localStorage)                   | 0.4.x   |
| Animation | framer-motion                                                        | 12.x    |
| Icons     | Lucide React (line icons only)                                       | —       |
| Fonts     | Plus Jakarta Sans 700 (headings), Inter 400/500 (body) via next/font | —       |

---

## GOLDEN RULE — No Hardcoded Content

**All content is data-driven from Payload CMS. Never.**

- Names, bios, affiliations → Payload `People` collection
- Publication titles, abstracts, links → Payload `Publications` collection
- Page copy, section headings → Payload `Pages` / `Globals`
- Footer text, social links → Payload `SiteSettings` global
- Colors scoped to a research theme → Payload field on the theme
- Counts (members, papers) → computed from DB queries, not literals
- Navigation items → Payload `Navigation` global

The only things allowed as literals in `.tsx` files are structural HTML/CSS (wrappers, layout classes) and aria attributes that are structural by nature.

---

## Design Tokens

Brand tokens are defined as CSS variables in `src/app/globals.css` and mapped
into the Tailwind v4 `@theme` block. **Never use raw hex codes in components.**

| Token           | Light     | Dark      |
| --------------- | --------- | --------- |
| `--color-teal`  | `#0E6E6E` | `#1A9090` |
| `--color-sand`  | `#E8C9A0` | `#7A5C38` |
| `--color-coral` | `#E2725B` | `#F08070` |
| `--color-ink`   | `#1A1A1A` | —         |
| `--color-paper` | `#F7F7F5` | —         |

Semantic aliases: `--bg`, `--fg`, `--muted`, `--border`, `--accent`, `--accent-hover`,
`--primary`, `--ring`, `--surface`, `--surface-raised`.

Use Tailwind utilities: `bg-bg`, `text-fg`, `text-muted`, `border-border`, `bg-accent`, etc.
Use CSS variables directly only for inline styles or one-offs: `var(--accent)`.

---

## Accessibility — Non-Negotiable (WCAG 2.2 AA)

- All interactive elements keyboard-navigable; visible focus ring (`outline` via `:focus-visible`).
- Minimum touch target: 44×44 px (Button enforces this with `min-h-[44px] min-w-[44px]`).
- Contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text. Verify with axe-core or Lighthouse.
- `alt` text required on every `<Image>` — never `alt=""` unless decorative + `aria-hidden="true"`.
- All motion respects `prefers-reduced-motion`. The `FadeUp` component no-ops automatically.
  Keyframe animations use `motion-safe:` Tailwind prefix or the `@media (prefers-reduced-motion)` block in globals.css.
- Video embeds require captions / transcript.
- No `outline: none` without a replacement; never suppress Husky or lint just to ship.

---

## Next.js 16 Conventions

- **Network boundary**: use `src/middleware.ts` (or `proxy.ts` if applicable) — `cookies()` and `headers()` are async; always `await` them.
- **Default to Server Components**. Add `'use client'` only when genuinely needed (hooks, event handlers, browser APIs).
- **Server Actions** for mutations (form submissions, data writes) — not API routes from the client.
- **`next/image`** for all images — never raw `<img>`. Set `sizes` for responsive images.
- **`next/font`** for all fonts — already configured in `src/app/layout.tsx`.
- Dynamic imports: `dynamic(() => import('./HeavyMap'), { ssr: false })` for map components.
- `generateStaticParams` for statically-knowable routes (publications, people).

---

## Performance Budget

| Metric           | Target          |
| ---------------- | --------------- |
| Lighthouse score | ≥ 90 (all four) |
| LCP              | < 2.5 s         |
| CLS              | < 0.1           |
| INP              | < 200 ms        |

- Use `next/image` with `priority` on above-the-fold images.
- Lazy-load below-the-fold sections with `dynamic()` or `loading="lazy"`.
- Dynamic-import the map with `ssr: false`.
- No large client bundles from Payload admin leaking into public routes (route groups enforce this).

---

## Route Structure

```
src/app/
  (frontend)/          ← public site (all public-facing pages)
    layout.tsx         ← wraps with ThemeProvider
    page.tsx           ← home
  (payload)/           ← Payload admin (never import into frontend)
    admin/
      [[...segments]]/ ← Payload RootPage
      importMap.js     ← auto-generated; run `npm run payload generate:importmap`
    api/
      [...slug]/       ← Payload REST API
    layout.tsx         ← passthrough (no ThemeProvider)
  layout.tsx           ← root: fonts, globals.css, html/body
  globals.css          ← design tokens, Tailwind @theme, keyframes
src/components/
  ui/                  ← Button, Container, Section
  motifs/              ← CellBlob, GrainTexture, MolecularDots
  MediaImage.tsx       ← theme-aware Payload media renderer (see below)
  FadeUp.tsx
src/providers/
  ThemeProvider.tsx
src/lib/
  utils.ts             ← cn() helper
  storage.ts           ← R2 adapter builder (returns [] in dev without creds)
```

---

## RichText Component

`src/components/RichText.tsx` renders a Payload Lexical `richText` field value as React JSX
using the official `@payloadcms/richtext-lexical/react` serializer. It is a **Server Component**
(no `'use client'`), safe to use anywhere in the App Router. No `dangerouslySetInnerHTML`.

```tsx
import { RichText } from '@/components/RichText'

// data comes from a Payload query richText field — e.g. person.bio, project.summary
;<RichText data={person.bio} className="max-w-3xl text-base" />
```

Rules:

- Always pass the raw richText field value from a Payload doc — never construct the object manually.
- The component applies the `.richtext` CSS class (typography styles in `globals.css`) plus any
  `className` you pass. Use `className` for layout constraints like `max-w-3xl`.
- `disableContainer` removes the wrapping `<div>` for inline rendering contexts.
- Reuse this component in Projects, Blog, Research pages, etc. — never inline a custom serializer.

---

## MediaImage Component

`src/components/MediaImage.tsx` renders a Payload `media` document as a responsive
`next/image`. It pulls `alt` from the doc (never hardcoded), builds the srcSet from
the three WebP size variants (300w / 800w / 1600w), and falls back gracefully when a
size is absent.

```tsx
import { MediaImage } from '@/components/MediaImage'
import type { Media } from '../../../payload-types'

// doc comes from a Payload query — never hardcoded content.
;<MediaImage
  doc={doc as Media}
  sizes="(max-width: 768px) 100vw, 50vw"
  priority // for above-the-fold images
  className="rounded-lg"
/>
```

Rules:

- Always pass the full `Media` doc from a Payload query — never construct the object
  from literals (Golden Rule applies to image metadata too).
- Use `priority` only on above-the-fold images (LCP candidate).
- Use `fill` when the parent is a positioned container with explicit dimensions.
- PDFs and MP4s have no `sizes` object — `MediaImage` renders the original URL.

---

## Commit Style — Conventional Commits

```
feat(people): add PeopleCard component
fix(admin): correct importMap path after Payload upgrade
chore(deps): bump payload to 3.x
style(globals): adjust muted token for dark mode contrast
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`.
Scope: the feature area or package name.
Never commit `payload-types.ts` if it has only whitespace diffs (regenerate only on schema change).

---

## What NOT to Do

- Do not hardcode content text in `.tsx` files (see Golden Rule).
- Do not use raw hex values in component classes — use semantic CSS variables or Tailwind utilities.
- Do not import from `(payload)/` in `(frontend)/` routes.
- Do not use `outline: none` without a replacement focus indicator.
- Do not skip `npm run typecheck` — the pre-commit hook enforces it.
- Do not add `console.log` to production code.
- Do not use `any` type without a comment explaining why.
- Do not `npm audit fix --force` without reviewing the breaking changes first.
