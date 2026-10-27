# Design system: "The Drawing Set"

**Concept:** the site is presented like a carefully documented renovation drawing set. Pages use numbered sheets, fine rules, captions, title blocks and architectural line drawings. That fits the brand promise, *"Thoughtful transformation. Clearly managed."*, because the design itself shows documentation, sequence and sign-off. Navy anchors every page, gold marks only the things that matter (the approval gate, highlighted units, primary actions), and white and grey keep reading calm.

## Colour tokens (`src/app/globals.css`)

| Token | Value | Use |
| --- | --- | --- |
| `navy` | #092B4D | Brand anchor: dark sections, body text on light |
| `navy-deep` | #061E36 | Footer, layered dark surfaces |
| `navy-line` | #1D4268 | Rules on navy |
| `gold` | #D9A23A | Brand accent: rules, fills, primary buttons, **text on navy only** |
| `gold-ink` | #8A5A0B | Gold for **text on white/grey** (5.9:1) |
| `gold-soft` | #E7C27A | Hover state on navy |
| `grey` / `grey-line` | #F5F7FA / #DFE4EB | Alternate sections / rules on light |
| `slate` | #4B5B6E | Secondary text on light (6.5:1 on grey) |
| `mist` | #A9B8C9 | Secondary text on navy (7.1:1) |

Brand gold on white is 2.29:1 and fails WCAG AA even for large text, so never use it for text on light backgrounds. Primary buttons are navy text on gold (6.27:1).

## Typography

Chosen for a calm, peaceful voice (revised at the owner's request from the original, more assertive pairing).

- **Display:** Cormorant Garamond 500/600 (roman + italic), an open, classical serif with gentle curves, for headlines and large numbers. The italic gold "*Elevate*" is the signature moment. Display sizes are set slightly larger to suit its small x-height.
- **Body/labels:** Nunito Sans (variable), a soft humanist sans, for body text at 17px/1.75 (−0.006em) and uppercase `.label` captions (600, 0.06em tracking). Headlines use −0.018em tracking; spacing was tightened at the owner's request.
- Both are SIL Open Font License fonts, self-hosted at build time by `next/font` (no requests to Google from visitors).
- Scale: `text-display-xl/lg/md/sm` (fluid `clamp()`), `text-lead`, `.label`. Prose is capped at about 65 characters per line.

## Layout and motifs

- 12-column grid inside `Sheet` (max 84rem, fluid gutter), with restrained asymmetry (sticky intro column + content column).
- Section labels: `01 ——— SERVICES` (`SectionLabel`).
- Running-bond brick hairline pattern (`.bond`) at 5–7% opacity on navy only; `BrickCourse` divider.
- Title-block grids (hero facts strip, footer) with 1px rules.
- Each service page has its own structure: renovation is a drawing schedule of work packages R1–R7, maintenance a visit cycle and inspection sheet, rental-ready a four-step turnover timeline, and management a responsibilities matrix.
- No cards-in-a-row grids, gradients, blobs or glassmorphism.

## Components (`src/components/`)

`ui.tsx` (Sheet, ButtonLink/ButtonAnchor, InspectionButton/InspectionTextLink, SectionLabel, Caption, AvailabilityTag, Breadcrumbs, JsonLd) · `sections.tsx` (FaqList on `<details>`, ProcessSequence, EnquiryBand) · `service.tsx` (ServiceHero, SectionIntro, AudienceList, TickList, DependencyNotes) · `drawings.tsx` (SVG illustrations) · `Header`/`NavMenu`/`Footer`/`MobileActionBar` · `LegalPage` · `Wordmark`.

Client components are limited to `NavMenu` and `MobileActionBar`. Everything else is rendered to static HTML at build time.

## Motion

CSS transitions only (link underlines, arrow nudge, menu chevron). `prefers-reduced-motion` disables them. No scroll effects, autoplay or custom cursors.

## Accessibility

Skip link, landmarks, one `h1` per page, visible focus rings (gold on navy, navy + gold halo on light), 44px minimum touch targets, keyboard-operable menus (Escape closes), and decorative drawings `aria-hidden` or labelled as illustrations.
