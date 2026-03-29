# hardikojha.com

A minimal personal site for documenting engineering decisions, tradeoffs, and systems thinking — the reasoning that doesn't show up in a résumé or GitHub profile.

Built with [Astro](https://astro.build). No UI libraries, no frameworks, plain CSS only. Deploys to GitHub Pages.

---

## Personalising for yourself

Only four files ever need to change:

| File | What it controls |
| :--- | :--- |
| `src/config.ts` | Your name, site URL, nav links, social handles |
| `src/content/pages/about.md` | Headline and intro on the writing list; full bio on the about page |
| `src/content/writing/*.md` | Every post |
| `astro.config.mjs` | Only needs updating when you move to a custom domain |

### `src/config.ts`

```ts
const config = {
  site: {
    name: 'Your Name',
    url: 'https://yourhandle.github.io',
    base: '/repo-name',   // set to '' if using a custom domain
    description: 'Your default meta description.',
  },
  nav: {
    links: [
      { label: 'writing', href: '/' },
      { label: 'about', href: '/about' },
    ],
  },
  social: {
    email: 'you@example.com',
    github: 'https://github.com/yourhandle',
    linkedin: 'https://linkedin.com/in/yourhandle',
    x: 'https://x.com/yourhandle',  // remove if not wanted
  },
};
```

### `src/content/pages/about.md`

```markdown
---
title: "About"
headline: "Your h1 on the writing list page."
intro: "The paragraph below the headline."
contact_intro: "Sentence shown above your contact icons."
---

Your bio here — free-form markdown, any sections you want.
```

---

## Writing posts

Drop a `.md` file into `src/content/writing/`. Two types are supported.

### `type: "decision"`

Use this when a decision is done and you know what happened.

The only things the plugin requires are:
- A section called `## What we considered` containing `###` option headings
- `✓ (chosen)` somewhere in the heading of the option you picked — that card turns green, the rest are grey
- A section called `## Outcome` — rendered as a left-bordered callout

Everything else (section names, structure, number of sections) is up to you.

```markdown
---
title: "..."
date: "YYYY-MM-DD"
type: "decision"
tags: ["architecture", "tradeoff", "avoided-failure"]
outcome: "One-line summary shown in the post list."
outcome_status: "positive"  # positive | neutral | warning
reading_time: "5 min"
---

## What we considered

### Option A — The simple approach
Your notes.

### Option B — The complex approach ✓ (chosen)
Your notes.

## Outcome
What happened.
```

### `type: "wip"`

Use this when you're still figuring something out. No outcome, no chosen option — a living document you update over time. Can be converted to `decision` later by swapping the `type` and adding the required frontmatter fields.

The only things the plugin looks for are:
- `` **`[solid]`** `` or `` **`[testing]`** `` at the start of a list item — becomes a green/amber chip
- A section called `## Open questions` — `>` blockquotes inside it become styled question blocks
- A section called `## Changelog` — list items become a two-column date/text layout

Everything else is free-form markdown.

```markdown
---
title: "..."
started: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
type: "wip"
summary: "One-line description shown in the post list."
---

## Open questions
> Something you don't have an answer to yet.

## What you know
- **`[solid]`** Something you're confident in.
- **`[testing]`** Something you're still validating.

## Changelog
- **YYYY-MM-DD** — What changed.
```

### Tags

These values have specific colors. Any other value renders as a grey chip.

| Tag | Color |
| :--- | :--- |
| `architecture` | Teal |
| `tradeoff` or `decision` | Purple |
| `avoided-failure` | Amber |

---

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the build locally |

## Deploying

Every push to `main` automatically builds and deploys via GitHub Actions.

**First-time setup:** go to your repo's **Settings → Pages** and set Source to **GitHub Actions**.

**Custom domain:** set `base: ''` and `url: 'https://yourdomain.com'` in `src/config.ts`, add your domain in **Settings → Pages → Custom domain**, then point your DNS A records to GitHub's IPs (`185.199.108-111.153`) and add a `CNAME` for `www` pointing to `yourhandle.github.io`.
