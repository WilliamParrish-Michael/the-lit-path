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
                         "Career change · 6 months of coaching".
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
  {
    quote: "I came in wanting a new job and left with a new direction. Robbert asks the questions you've been avoiding — kindly, but he asks them.",
    name: "Danielle M.",
    note: "Career change · 6 months of coaching",
    source: "direct",
    show: true,
    sample: true
  },
  {
    quote: "The accountability between sessions is what changed things for me. For the first time, my goals survived contact with a busy week.",
    name: "James R.",
    note: "Small business owner",
    source: "direct",
    show: true,
    sample: true
  },
  {
    quote: "I expected a pep talk. What I got was a plan, a mirror, and someone who genuinely would not let me quit on myself.",
    name: "Alicia T.",
    note: "Returning to school at 38",
    source: "direct",
    show: true,
    sample: true
  },
  {
    quote: "Worth every session. I stopped circling the same decision for two years and finally made it — and it was the right one.",
    name: "Marcus B.",
    note: "Relocation & fresh start",
    source: "direct",
    show: true,
    sample: true
  }
];
