# Angelo Mouawad: Personal Website

A late night room you can scroll through. The camera moves from the doorway to the desk and into the monitor, and past the screen the site opens into a brighter world.

| Where | What |
|---|---|
| `/` | The room, then the monitor scene: about, projects and contact |
| `/websites` | Web design services and live client work |
| `/notes` | Study notes rendered from markdown |
| `/bible` | The King James Bible with reading plans, highlights, notes and progress |
| `/theme` | Reference page for the shared design system (not indexed) |

In the room, three objects are links: the notebooks (`/notes`), the Bible (`/bible`) and the studio poster (`/websites`). The dock at the bottom leads to the same places.

## Stack

Next.js (App Router, TypeScript, static export), React Three Fiber with drei and postprocessing, Lenis for scrolling, Motion for scroll driven animation and transitions, GSAP for camera moves, Tailwind and shadcn/ui, zustand for state. Notes use unified (remark, rehype), KaTeX and Shiki.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build the static export

```bash
npm run build
```

The site is written to `out/`, which is everything GitHub Pages needs. `public/CNAME` and `public/.nojekyll` are copied in, so the custom domain keeps working. A small `postbuild` step copies the route prefetch files to the names the browser asks for. To preview the export:

```bash
npx serve out
```

## How to add things

### A project (monitor scene)

Add an entry to `src/data/projects.ts`. Numbering, the counter, the 3D capsules and the tech marquee all follow that list. The three "coming soon" slots at the bottom are ordinary entries with `status: "soon"`: replace the text, add `tech` and `links`, and delete the `status` line.

The about text, facts and contact links are in `src/data/profile.ts`. Facts marked `todo: true` show a dashed TODO tag until you fill them in.

The commit skyline reads `src/data/contributions.json`. Refresh it with:

```bash
npm run contributions
```

### A website (/websites)

1. Add an entry to `src/data/websites.ts` (name, URL, repo, description, stack).
2. Add its slug and URL to the list in `scripts/site-shots.mjs`.
3. Run `npm run site-shots` to capture `public/sites/<slug>-desktop.webp` and `<slug>-mobile.webp`.

Services and process steps are in the same data file.

### Notes (/notes)

Notes are markdown files in `content/notes`. Each folder becomes a folder in the sidebar and each `.md` file becomes its own page:

```
content/notes/
  math/
    linear-algebra-basics.md   ->  /notes/math/linear-algebra-basics
    probability-cheatsheet.md  ->  /notes/math/probability-cheatsheet
  algorithms/
    ...
```

To add a note, add a file. Optional frontmatter sets the title and position:

```md
---
title: Linear algebra basics
order: 1
---
```

Supported: headings, tables, task lists, code blocks with highlighting and a copy button, images and files beside the note (use relative paths), inline SVG, maths with `$...$` and `$$...$$`, links to other notes (`./other-note.md`) and callouts written as `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]` or `> [!CAUTION]`.

**Using the real notes repository.** Everything is read at build time from one folder, set in `src/lib/notes/source.ts`. Either check the notes repo out into `content/notes` (a git submodule works well), or point the build at it:

```bash
NOTES_DIR=../my-notes npm run build
```

### A reading plan (/bible)

Add a JSON file to `src/lib/bible/data/readingPlans` and list it in the two places at the top of `src/lib/bible/data/plans.ts`. The file format is the same one the standalone Lamp app uses.

## The contact form

The form on `/websites` uses [Web3Forms](https://web3forms.com), which works on a static host. Create a free access key there, copy `.env.example` to `.env.local` and fill it in:

```
NEXT_PUBLIC_WEB3FORMS_KEY=your-access-key
```

The key is public by design. It is read at build time, so it also has to be set wherever the site is built. Without a key the form still works: it opens the visitor's mail app with the message filled in.

## Assets

Models, textures and the HDRI are committed in `public/` already compressed. To rebuild them from source run `npm run assets`. Licences and authors are in [CREDITS.md](CREDITS.md).

## Folder structure

```
content/notes/         sample notes (swap for the real notes repo)
public/
  models/ textures/ hdri/   the room's 3D assets
  images/                   photos
  sites/                    screenshots for /websites
  bible-data/kjv/           the King James text, one file per book
scripts/               asset pipeline, screenshots, contributions, notes assets
src/
  app/                 routes only: each page hands over to a component
  components/
    room/              the 3D room
      scene/ models/ interactions/ camera/
      ui/              loader and overlay
    world/             the shared design system and the pages beyond the room
      home/ websites/ notes/ bible/
    ui/                shadcn primitives: button, dialog, sheet
    vendor/            third party components used as shipped
  data/                profile, projects, websites, contributions
  hooks/               hooks shared across the site
  lib/                 logic with no UI
    bible/             saved data, progress, search, plans, routing
    notes/             markdown loader and renderer
  store/               room state
```

## How it fits together

- **One design system.** Tokens, type styles and surfaces live in `src/app/globals.css`. Buttons, dialogs and sheets are in `components/ui`, the rest (panels, chips, links, reveals, the dock, the page shell) in `components/world`. `/theme` shows all of it.
- **Scroll on the home page.** `SmoothScroll` turns the scroll position into progress through the room, then a dive value while the screen opens. Each section of the monitor scene reports its own progress to `lib/scroll.ts`, which the DOM and the 3D layer both read.
- **Two canvases.** The room stops rendering once you are inside the monitor, and a lighter transparent canvas takes over.
- **Transitions.** Leaving the room, a point of light grows to fill the screen (`LightBloom`). Every page beyond it starts as light and opens outward (`LightGate`).
- **Bible.** The screens are in `components/world/bible` and use the shared design system. The logic in `src/lib/bible` has no UI. Reading data is saved in the visitor's browser under `lamp.bibleApp.v1`, in the same shape the standalone Lamp app uses under `bibleApp.v1`. Views are addressed in the URL hash, for example `/bible/#/bible/JHN/3/16`. Progress is always drawn with `ProgressRing` from `components/world/bible/ui.tsx`.
- **Reduced motion.** Pinned and scrubbed sections fall back to plain stacked layouts, and Lenis, the intro and the page transitions are switched off.
