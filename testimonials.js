/* ============================================================
   The Lit Path — testimonials data
   This is the ONLY file to edit when adding, hiding, or removing
   testimonials. The home page reads this list and renders the
   cards automatically.

   Fields per entry:
     quote   (required)  The testimonial text, plain text.
     name    (required)  Display name, e.g. "Danielle M." — use
                         first name + last initial unless the
                         client has written permission for more.
     note    (optional)  Small line under the name, e.g.
                         "Parent" or "In recovery".
     source  (required)  Where the review came from. One of:
                         "google" | "yelp" | "instagram" |
                         "facebook" | "direct"
                         Shown as a badge on the card. When more
                         than one source is present, visitors get
                         filter buttons (All / Google / Yelp / …).
     show    (required)  true  = displayed on the site
                         false = kept here but hidden (easy way to
                         rotate reviews without deleting them).
     sample  (optional)  true marks placeholder content written by
                         the site builder. DELETE or replace all
                         sample entries once real reviews exist.

   Only publish real client reviews with the client's written
   permission.
   ============================================================ */

const TESTIMONIALS = [
  /* Example — copy, fill in, and set show: true once you have the
     person's written permission:
  {
    quote: "…",
    name: "Maria L.",
    note: "Parent",
    source: "direct",
    show: true
  },
  */
];
