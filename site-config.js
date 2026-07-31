/* ============================================================
   The Lit Path — site configuration
   LITPATH_API: base URL of the testimonials/blog API (Render).
   If the Render service gets a different name, update this one
   line and everything (home page, blog, post page, admin) follows.
   STATIC_POSTS: the three hand-built launch posts, so live posts
   from the API and static posts merge into one ordered list.
   ============================================================ */

const LITPATH_API = 'https://the-lit-path-api.onrender.com';

const STATIC_POSTS = [
  {
    url: 'blog/what-a-life-coach-actually-does.html',
    title: "What a life coach actually does (and doesn't do)",
    description: "It isn't therapy, it isn't advice, and it definitely isn't a pep talk. Here's what the work really looks like.",
    published_at: '2026-07-31T00:00:00Z'
  },
  {
    url: 'blog/five-signs-youre-ready-for-a-change.html',
    title: "Five signs you're ready for a change — even if it doesn't feel like it",
    description: 'Readiness rarely announces itself. More often it looks like restlessness, envy, or a decision you keep circling.',
    published_at: '2026-07-30T00:00:00Z'
  },
  {
    url: 'blog/goals-that-survive-february.html',
    title: 'How to set goals that survive February',
    description: "Most goals don't fail from lack of willpower. They fail at the design stage. Build them differently.",
    published_at: '2026-07-29T00:00:00Z'
  }
];

/* Fetch JSON with a timeout so a sleeping free-tier API never leaves
   visitors staring at a spinner — callers fall back to static content. */
function litpathFetch(path, ms) {
  var ctrl = new AbortController();
  var t = setTimeout(function () { ctrl.abort(); }, ms || 4500);
  return fetch(LITPATH_API + path, { signal: ctrl.signal })
    .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (j) { if (j.error) throw new Error(j.error.message); return j.data; });
}

function litpathMonthYear(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) { return ''; }
}
