/* ============================================================
   The Lit Path — site configuration
   LITPATH_API: base URL of the testimonials/blog API (Render).
   If the Render service gets a different name, update this one
   line and everything (home page, blog, post page, admin) follows.
   STATIC_POSTS: the three hand-built posts, so live posts
   from the API and static posts merge into one ordered list.
   ============================================================ */

const LITPATH_API = 'https://the-lit-path-api.onrender.com';

const STATIC_POSTS = [
  {
    url: 'blog/what-happens-at-an-intervention.html',
    title: 'What actually happens at an intervention',
    description: 'It is not what television shows. How we prepare a family, what the conversation looks like, and what happens the moment someone says yes.',
    published_at: '2026-10-19T00:00:00Z'
  },
  {
    url: 'blog/when-your-loved-one-comes-home.html',
    title: 'When your loved one comes home from treatment',
    description: 'The first weeks home are often harder than the family expects. What to expect, what to watch for, and how to hold boundaries without pushing them away.',
    published_at: '2026-10-18T00:00:00Z'
  },
  {
    url: 'blog/what-a-sober-companion-does.html',
    title: 'What a sober companion actually does',
    description: 'The hours between saying yes and the facility door are the most dangerous. A sober companion exists for exactly those hours.',
    published_at: '2026-10-17T00:00:00Z'
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
