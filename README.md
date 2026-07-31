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

## ⚠️ TODO before promoting the site

1. **Logo** — a custom mark now ships with the site: a dotted footstep trail
   winding up into a flame (inline `.brand-flame` SVG on every page,
   `favicon.svg`, and a standalone lockup in `logo.svg` for social profiles).
   If the client later supplies their own logo, swap those three spots.
2. **Accreditations** — a commented-out credentials block sits in `index.html`
   under `<!-- ACCREDITATIONS -->`. Fill it in when the client's certifications
   arrive.
3. **Testimonials are SAMPLES** — the four cards in `index.html` (marked
   `SAMPLE TESTIMONIALS` in a comment) were written as placeholders. Replace
   with real client reviews (with written permission) before launch.
4. **Social links** — Instagram is live (`https://www.instagram.com/thel.itpath`).
   Facebook, LinkedIn, and YouTube icons point at `#` (marked `TODO` in
   `index.html`) — insert real URLs when provided.
5. **Verify the coach's name spelling** — "Robbert Ferd" was inferred from the
   email address; confirm with the client.
6. **Custom domain (optional)** — when the client buys a domain, add a `CNAME`
   file and update the absolute URLs in: OG tags, JSON-LD, `_next` form field,
   `robots.txt`, `sitemap.xml`.

## Deploying changes

Push to `main` — GitHub Pages redeploys automatically. No build step.
