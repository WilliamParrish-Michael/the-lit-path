# The Lit Path — interventions & sober companionship website

Static marketing site for The Lit Path: family reunification interventions, treatment placement, sober companionship, and family support. Brand assets and the client's mission statement live in `brand/`; web-ready logo/photo files in `img/`.
Same architecture as the Kathors Peptides site: plain HTML/CSS, no build step,
FormSubmit contact form, hosted free on GitHub Pages.

**Live:** https://williamparrish-michael.github.io/the-lit-path/

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, services, how it works, for families (incl. 988/911), about, stories + socials, blog preview, contact form |
| `blog.html` | Blog index ("Field notes") |
| `blog/*.html` | Individual posts (3 starter posts: interventions, coming home, sober companions) |
| `thanks.html` | Post-submit landing page for the contact form |
| `privacy.html`, `terms.html` | Legal pages (incl. not-a-treatment-provider / no-guaranteed-outcome disclaimers) |
| `sitemap.xml`, `robots.txt` | SEO |

## Contact form

Uses [FormSubmit](https://formsubmit.co) → delivers to `Robbertferd@gmail.com`.
**First submission ever** triggers a one-time activation email from FormSubmit to
that inbox — the client must click the confirmation link once, after which all
submissions flow normally.

## Admin portal & API (semi-live content)

The site now has a lightweight backend so the client can manage content
without touching files:

- **`admin.html`** — password-protected portal (one approved account).
  Testimonials tab: pending queue → Approve / Hide / Delete, plus manual
  paste-in for reviews arriving via Google/Yelp/email. Blog tab: write
  field notes in markdown, save as draft, publish/unpublish.
- **Visitors** can submit their own story on the home page ("Share your
  story") — it lands in the pending queue and displays only after approval.
- **`api/`** — Express + Postgres API (see `api/server.js` for endpoints).
  Public pages fetch live content with a 4.5s timeout and fall back to the
  static bundled content, so a sleeping free-tier server never blanks the
  site.
- `site-config.js` holds the API base URL (`LITPATH_API`) — one line to
  change if the service URL differs.

### One-time deployment (≈10 minutes)

1. **Neon (free Postgres):** create a project at https://neon.tech →
   copy the connection string (`postgres://…neon.tech/…?sslmode=require`).
2. **Render:** New → Blueprint → pick this repo (`render.yaml` defines the
   service `the-lit-path-api`, free plan, root `api/`). When prompted, set:
   - `DATABASE_URL` = the Neon connection string
   - `ADMIN_PASSWORD` = the portal password (pick something strong)
   - `JWT_SECRET` auto-generates.
3. Confirm the service URL is `https://the-lit-path-api.onrender.com` —
   if Render assigned a different name, update `LITPATH_API` in
   `site-config.js` and push.
4. Open `admin.html` on the live site, sign in, and you're managing content.

Free-tier behavior: the API sleeps after ~15 idle minutes; the first
request after that takes 30–50s (visitors see the static fallback
meanwhile; the admin portal shows a "waking up" note).

## Adding a blog post

**Preferred: use the admin portal** (blog tab) — markdown in, live in
seconds at `post.html?slug=…`, merged automatically into the blog index
and the home-page Field Notes.

**Static alternative** (for hand-crafted posts with custom layout):

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
- The array ships EMPTY. Real reviews only — this is an addiction-services
  site, and placeholder testimonials would be a trust and compliance problem.

## ⚠️ TODO before promoting the site

1. **Accreditations / training** — a commented-out credentials block sits in
   `index.html` under `<!-- ACCREDITATIONS -->`. The copy currently says
   companions are "trained in overdose response"; name the actual training or
   certification (CPR/First Aid, naloxone, CADC, intervention training) when the
   client confirms it, and do not say "certified" until there is a certificate.
2. **"Guarantee a place"** — the client's mission statement says they *guarantee*
   placement. The site says "secure placement" / "work directly with the
   facility". Confirm with the client before using the word guarantee anywhere.
3. **Testimonials** — `testimonials.js` is empty on purpose. Add real reviews
   (with written permission) or approve them through the admin portal.
4. **Social & review links** — Instagram and Facebook are live. Google and Yelp
   icons point at `#` (marked `TODO` in `index.html`) — insert the Google
   Business Profile review link and the Yelp business page when provided.
5. **Contact email** — the form still delivers to `Robbertferd@gmail.com`;
   confirm this is the right inbox for the interventions business.
6. **Hero photo** — `img/hero-family-*.jpg` is the stock image from the client's
   handout. Alt text does not claim they are clients. Confirm the client holds a
   license for web use.
7. **Custom domain (optional)** — when the client buys a domain, add a `CNAME`
   file and update the absolute URLs in: OG tags, JSON-LD, `_next` form field,
   `robots.txt`, `sitemap.xml`.

## Deploying changes

Push to `main` — GitHub Pages redeploys automatically. No build step.
