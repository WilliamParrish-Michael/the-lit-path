# The Lit Path — life coaching website

Static marketing site for The Lit Path (life coaching practice of Robbert Ferd).
Same architecture as the Kathors Peptides site: plain HTML/CSS, no build step,
FormSubmit contact form, hosted free on GitHub Pages.

**Live:** https://williamparrish-michael.github.io/the-lit-path/

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, about, how it works, testimonials + socials, blog preview, contact form |
| `blog.html` | Blog index ("Field notes") |
| `blog/*.html` | Individual posts (3 starter posts for SEO/marketing) |
| `thanks.html` | Post-submit landing page for the contact form |
| `privacy.html`, `terms.html` | Legal pages (incl. coaching-is-not-therapy disclaimer) |
| `sitemap.xml`, `robots.txt` | SEO |

## Contact form

Uses [FormSubmit](https://formsubmit.co) → delivers to `Robbertferd@gmail.com`.
**First submission ever** triggers a one-time activation email from FormSubmit to
that inbox — the client must click the confirmation link once, after which all
submissions flow normally.

## Adding a blog post

1. Copy `blog/_template.html` → `blog/short-slug.html` (lowercase, hyphens).
2. Replace the ALL-CAPS placeholders (title, description, date, slug, body) —
   instructions are in a comment at the top of the template.
3. Add a card to `blog.html` (copy an existing `.bcard` block); optionally swap
   one of the three featured cards in `index.html` `#notes`.
4. Add the URL to `sitemap.xml`.
5. Push to `main` — live in ~1 minute.

In practice: the client emails the post text to you, and steps 1–5 take a few
minutes (or ask Claude Code to do it from the raw text).

## Managing testimonials

All testimonials live in **`testimonials.js`** — the home page renders them
automatically. Each entry has `quote`, `name`, `note`, `source`
(`google` / `yelp` / `instagram` / `facebook` / `direct`), and `show`.

- **Add a review:** append an object to the array. Only publish real client
  reviews with written permission.
- **Hide a review without deleting it:** set `show: false`.
- **Source badge:** each card shows where the review came from.
- **Visitor filtering:** when displayed reviews span more than one source,
  filter buttons (All / Google / Yelp / …) appear automatically above the grid.
- Entries marked `sample: true` are placeholders — replace them before launch.

## ⚠️ TODO before promoting the site

1. **Logo** — a custom mark now ships with the site: a dotted footstep trail
   winding up into a flame (inline `.brand-flame` SVG on every page,
   `favicon.svg`, and a standalone lockup in `logo.svg` for social profiles).
   If the client later supplies their own logo, swap those three spots.
2. **Accreditations** — a commented-out credentials block sits in `index.html`
   under `<!-- ACCREDITATIONS -->`. Fill it in when the client's certifications
   arrive.
3. **Testimonials are SAMPLES** — the entries in `testimonials.js` are marked
   `sample: true`. Replace with real client reviews (with written permission)
   before launch.
4. **Social & review links** — Instagram is live
   (`https://www.instagram.com/thel.itpath`). Facebook, LinkedIn, YouTube,
   Google, and Yelp icons point at `#` (marked `TODO` in `index.html`) — insert
   the real profile URLs, the Google Business Profile review link, and the Yelp
   business page when provided.
5. **Verify the coach's name spelling** — "Robbert Ferd" was inferred from the
   email address; confirm with the client.
6. **Custom domain (optional)** — when the client buys a domain, add a `CNAME`
   file and update the absolute URLs in: OG tags, JSON-LD, `_next` form field,
   `robots.txt`, `sitemap.xml`.

## Deploying changes

Push to `main` — GitHub Pages redeploys automatically. No build step.
