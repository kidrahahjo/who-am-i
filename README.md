# hardikojha.com

A minimal personal site for documenting engineering decisions, tradeoffs, and systems thinking — the reasoning that doesn't show up in a résumé or GitHub profile.

Built with [Astro](https://astro.build). No UI libraries, no frameworks, plain CSS only. Deploys to GitHub Pages.

## How this was set up

Scaffolded from the Astro minimal template:

```sh
npm create astro@latest -- --template minimal
```

From there, the following were added by hand:

- **Two content types** as Astro content collections — Decision Records and WIP (work-in-progress) documents, both stored as markdown files in `src/content/writing/`
- **A custom rehype plugin** (`rehype-writing-transform.mjs`) that runs at build time to transform markdown into styled components: option cards for decision records, solid/testing chips for WIP observations, and formatted changelog entries — no client-side JavaScript required
- **A single config file** (`src/config.ts`) as the source of truth for site name, nav links, and social URLs
- **Markdown-driven pages** — the about page body and the writing list headline/intro are both driven by `src/content/pages/about.md`, so no component code needs to change for content updates
- **Inline SVG social icons** with no external dependencies, conditionally rendered based on which keys are present in `config.social`
- **GitHub Actions workflow** for automatic deployment to GitHub Pages on every push to `main`

## Using this as your own template

To adapt this site for yourself, you only need to touch four files:

### 1. `src/config.ts`

```ts
const config = {
  site: {
    name: 'Your Name',
    description: 'Your site description for SEO meta tags.',
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
    x: 'https://x.com/yourhandle',   // remove this line if you don't want X
  },
};
```

### 2. `src/content/pages/about.md`

```yaml
---
title: "About"
contact_intro: "Sentence shown above your contact icons."
headline: "The h1 shown at the top of the writing list page."
intro: "The paragraph shown below the headline."
---

Your bio goes here as free-form markdown. Add any sections you want.
```

### 3. `astro.config.mjs`

Update the `site` field to your domain:

```js
export default defineConfig({
  site: 'https://yourdomain.com',
  ...
});
```

### 4. `src/content/writing/`

Add your own posts here. Two types are supported:

**Decision record** — documents a decision you made, the options you considered, and the outcome:

```yaml
---
title: "Title of the decision"
date: "YYYY-MM-DD"
type: "decision"
tags: ["architecture", "tradeoff", "avoided-failure"]
outcome: "One-line summary of what happened."
outcome_status: "positive"   # positive | neutral | warning
reading_time: "5 min"
---

## The situation
## What we considered
### Option A — ...
### Option B — ... ✓ (chosen)
## The real reasoning
## Outcome
```

**WIP document** — captures evolving thinking, open questions, and observations in progress:

```yaml
---
title: "Title of the working document"
started: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
type: "wip"
summary: "One-line description shown in the post list."
---

## The intuition I'm trying to capture
## What I know feels solid
- **`[solid]`** This observation is stable.
- **`[testing]`** This is a hypothesis I haven't validated yet.
## Open questions
> Your question here.
## Changelog
- **YYYY-MM-DD** — What changed.
```

The rehype plugin picks up these structures automatically — no special syntax beyond what's shown above.

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the build locally |

## Deploying

Deployment is automated via GitHub Actions. Every push to `main` triggers a build and deploys to GitHub Pages. See `.github/workflows/deploy.yml`.

For a custom domain, add your domain in **Settings → Pages → Custom domain** in your GitHub repo, then point your DNS A records to GitHub's IPs and set a CNAME for `www`.
