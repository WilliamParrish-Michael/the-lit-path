/**
 * The Lit Path — testimonials + blog API.
 *
 * Public:  GET  /api/health
 *          GET  /api/testimonials            approved testimonials
 *          POST /api/testimonials            submit a review (lands as "pending")
 *          GET  /api/posts                   published post list (no bodies)
 *          GET  /api/posts/:slug             one published post with body
 * Admin (Bearer token from /api/admin/login):
 *          POST  /api/admin/login            { password } -> { token }
 *          GET   /api/admin/testimonials     all statuses
 *          PATCH /api/admin/testimonials/:id status/fields
 *          DELETE /api/admin/testimonials/:id
 *          GET   /api/admin/posts            all posts incl. drafts
 *          POST  /api/admin/posts            create
 *          PATCH /api/admin/posts/:id        update
 *          DELETE /api/admin/posts/:id
 *
 * Env: DATABASE_URL (Neon/Render Postgres), ADMIN_PASSWORD, JWT_SECRET,
 *      ALLOWED_ORIGINS (comma-separated), PORT (set by Render).
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const PORT = process.env.PORT || 10000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const SOURCES = ['google', 'yelp', 'instagram', 'facebook', 'direct'];
const STATUSES = ['pending', 'approved', 'hidden'];

if (!process.env.DATABASE_URL || !ADMIN_PASSWORD || !JWT_SECRET) {
  console.error(JSON.stringify({ level: 'fatal', event: 'missing_env', need: ['DATABASE_URL', 'ADMIN_PASSWORD', 'JWT_SECRET'] }));
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5
});

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '200kb' }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://williamparrish-michael.github.io')
  .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
app.use(cors({
  origin: function (origin, cb) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) return cb(null, true);
    cb(new Error('Origin not allowed'));
  }
}));

/* ---------- tiny in-memory rate limiter (per IP per bucket) ---------- */
const hits = new Map();
function rateLimit(bucket, max, windowMs) {
  return function (req, res, next) {
    const key = bucket + ':' + req.ip;
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
    entry.count += 1;
    hits.set(key, entry);
    if (entry.count > max) {
      log('warn', 'rate_limited', { bucket: bucket, ip: req.ip });
      return res.status(429).json({ data: null, error: { message: 'Too many requests — try again later.', code: 'RATE_LIMITED' } });
    }
    next();
  };
}
setInterval(function () {
  const now = Date.now();
  hits.forEach(function (v, k) { if (now > v.reset) hits.delete(k); });
}, 60000).unref();

function log(level, event, context) {
  console.log(JSON.stringify(Object.assign({ timestamp: new Date().toISOString(), level: level, event: event }, context || {})));
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ data: null, error: { message: 'Sign in required.', code: 'UNAUTHORIZED' } });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ data: null, error: { message: 'Session expired — sign in again.', code: 'UNAUTHORIZED' } });
  }
}

function clean(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

/* ---------- schema ---------- */
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      quote TEXT NOT NULL,
      name TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'direct',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      body_md TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT false,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  log('info', 'migrate_ok', {});
}

/* ---------- public ---------- */

app.get('/api/health', function (req, res) {
  res.json({ data: { ok: true }, error: null });
});

app.get('/api/testimonials', async function (req, res) {
  try {
    const r = await pool.query(
      "SELECT id, quote, name, note, source FROM testimonials WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50"
    );
    res.json({ data: r.rows, error: null });
  } catch (e) {
    log('error', 'testimonials_list_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Could not load testimonials.', code: 'DB_ERROR' } });
  }
});

app.post('/api/testimonials', rateLimit('submit', 5, 15 * 60 * 1000), async function (req, res) {
  const body = req.body || {};
  if (body.website) {
    // Honeypot field filled -> bot. Pretend success.
    log('warn', 'honeypot_tripped', { ip: req.ip });
    return res.json({ data: { received: true }, error: null });
  }
  const quote = clean(body.quote, 600);
  const name = clean(body.name, 80);
  const note = clean(body.note, 120);
  const source = SOURCES.indexOf(body.source) !== -1 ? body.source : 'direct';
  if (quote.length < 20 || name.length < 2) {
    return res.status(400).json({ data: null, error: { message: 'Please include your name and a review of at least 20 characters.', code: 'VALIDATION' } });
  }
  try {
    await pool.query(
      "INSERT INTO testimonials (quote, name, note, source, status) VALUES ($1, $2, $3, $4, 'pending')",
      [quote, name, note, source]
    );
    log('info', 'testimonial_submitted', { ip: req.ip });
    res.json({ data: { received: true }, error: null });
  } catch (e) {
    log('error', 'testimonial_submit_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Could not save your review — please try again or email us.', code: 'DB_ERROR' } });
  }
});

app.get('/api/posts', async function (req, res) {
  try {
    const r = await pool.query(
      'SELECT slug, title, description, published_at FROM posts WHERE published = true ORDER BY published_at DESC LIMIT 100'
    );
    res.json({ data: r.rows, error: null });
  } catch (e) {
    log('error', 'posts_list_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Could not load posts.', code: 'DB_ERROR' } });
  }
});

app.get('/api/posts/:slug', async function (req, res) {
  try {
    const r = await pool.query(
      'SELECT slug, title, description, body_md, published_at FROM posts WHERE published = true AND slug = $1',
      [String(req.params.slug).slice(0, 120)]
    );
    if (!r.rows.length) return res.status(404).json({ data: null, error: { message: 'Post not found.', code: 'NOT_FOUND' } });
    res.json({ data: r.rows[0], error: null });
  } catch (e) {
    log('error', 'post_get_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Could not load the post.', code: 'DB_ERROR' } });
  }
});

/* ---------- admin ---------- */

app.post('/api/admin/login', rateLimit('login', 10, 15 * 60 * 1000), function (req, res) {
  const password = (req.body || {}).password || '';
  if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
    log('warn', 'admin_login_failed', { ip: req.ip });
    return res.status(401).json({ data: null, error: { message: 'Wrong password.', code: 'UNAUTHORIZED' } });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  log('info', 'admin_login_ok', { ip: req.ip });
  res.json({ data: { token: token }, error: null });
});

app.get('/api/admin/testimonials', requireAdmin, async function (req, res) {
  try {
    const r = await pool.query(
      'SELECT id, quote, name, note, source, status, created_at FROM testimonials ORDER BY created_at DESC LIMIT 500'
    );
    res.json({ data: r.rows, error: null });
  } catch (e) {
    log('error', 'admin_testimonials_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Could not load testimonials.', code: 'DB_ERROR' } });
  }
});

app.patch('/api/admin/testimonials/:id', requireAdmin, async function (req, res) {
  const id = parseInt(req.params.id, 10);
  const body = req.body || {};
  const sets = [];
  const vals = [];
  if (body.status !== undefined) {
    if (STATUSES.indexOf(body.status) === -1) return res.status(400).json({ data: null, error: { message: 'Invalid status.', code: 'VALIDATION' } });
    vals.push(body.status); sets.push('status = $' + vals.length);
  }
  if (body.quote !== undefined) { vals.push(clean(body.quote, 600)); sets.push('quote = $' + vals.length); }
  if (body.name !== undefined) { vals.push(clean(body.name, 80)); sets.push('name = $' + vals.length); }
  if (body.note !== undefined) { vals.push(clean(body.note, 120)); sets.push('note = $' + vals.length); }
  if (body.source !== undefined) {
    if (SOURCES.indexOf(body.source) === -1) return res.status(400).json({ data: null, error: { message: 'Invalid source.', code: 'VALIDATION' } });
    vals.push(body.source); sets.push('source = $' + vals.length);
  }
  if (!sets.length || !Number.isInteger(id)) return res.status(400).json({ data: null, error: { message: 'Nothing to update.', code: 'VALIDATION' } });
  vals.push(id);
  try {
    const r = await pool.query(
      'UPDATE testimonials SET ' + sets.join(', ') + ', updated_at = now() WHERE id = $' + vals.length + ' RETURNING id, status',
      vals
    );
    if (!r.rows.length) return res.status(404).json({ data: null, error: { message: 'Not found.', code: 'NOT_FOUND' } });
    res.json({ data: r.rows[0], error: null });
  } catch (e) {
    log('error', 'admin_testimonial_update_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Update failed.', code: 'DB_ERROR' } });
  }
});

app.delete('/api/admin/testimonials/:id', requireAdmin, async function (req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ data: null, error: { message: 'Invalid id.', code: 'VALIDATION' } });
  try {
    await pool.query('DELETE FROM testimonials WHERE id = $1', [id]);
    res.json({ data: { deleted: true }, error: null });
  } catch (e) {
    log('error', 'admin_testimonial_delete_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Delete failed.', code: 'DB_ERROR' } });
  }
});

app.get('/api/admin/posts', requireAdmin, async function (req, res) {
  try {
    const r = await pool.query(
      'SELECT id, slug, title, description, body_md, published, published_at, updated_at FROM posts ORDER BY COALESCE(published_at, created_at) DESC LIMIT 500'
    );
    res.json({ data: r.rows, error: null });
  } catch (e) {
    log('error', 'admin_posts_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Could not load posts.', code: 'DB_ERROR' } });
  }
});

function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
}

app.post('/api/admin/posts', requireAdmin, async function (req, res) {
  const body = req.body || {};
  const title = clean(body.title, 160);
  const slug = slugify(body.slug || title);
  const description = clean(body.description, 300);
  const bodyMd = typeof body.body_md === 'string' ? body.body_md.slice(0, 50000) : '';
  const published = body.published === true;
  if (!title || !slug || bodyMd.length < 50) {
    return res.status(400).json({ data: null, error: { message: 'A post needs a title and at least 50 characters of body text.', code: 'VALIDATION' } });
  }
  try {
    const r = await pool.query(
      `INSERT INTO posts (slug, title, description, body_md, published, published_at)
       VALUES ($1, $2, $3, $4, $5, CASE WHEN $5 THEN now() ELSE NULL END)
       RETURNING id, slug, published`,
      [slug, title, description, bodyMd, published]
    );
    log('info', 'post_created', { slug: slug, published: published });
    res.json({ data: r.rows[0], error: null });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ data: null, error: { message: 'That slug already exists — pick another.', code: 'DUPLICATE' } });
    log('error', 'post_create_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Could not save the post.', code: 'DB_ERROR' } });
  }
});

app.patch('/api/admin/posts/:id', requireAdmin, async function (req, res) {
  const id = parseInt(req.params.id, 10);
  const body = req.body || {};
  const sets = [];
  const vals = [];
  if (body.title !== undefined) { vals.push(clean(body.title, 160)); sets.push('title = $' + vals.length); }
  if (body.slug !== undefined) { vals.push(slugify(body.slug)); sets.push('slug = $' + vals.length); }
  if (body.description !== undefined) { vals.push(clean(body.description, 300)); sets.push('description = $' + vals.length); }
  if (body.body_md !== undefined) { vals.push(String(body.body_md).slice(0, 50000)); sets.push('body_md = $' + vals.length); }
  if (body.published !== undefined) {
    vals.push(body.published === true); sets.push('published = $' + vals.length);
    sets.push('published_at = CASE WHEN $' + vals.length + ' AND published_at IS NULL THEN now() ELSE published_at END');
  }
  if (!sets.length || !Number.isInteger(id)) return res.status(400).json({ data: null, error: { message: 'Nothing to update.', code: 'VALIDATION' } });
  vals.push(id);
  try {
    const r = await pool.query(
      'UPDATE posts SET ' + sets.join(', ') + ', updated_at = now() WHERE id = $' + vals.length + ' RETURNING id, slug, published',
      vals
    );
    if (!r.rows.length) return res.status(404).json({ data: null, error: { message: 'Not found.', code: 'NOT_FOUND' } });
    res.json({ data: r.rows[0], error: null });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ data: null, error: { message: 'That slug already exists — pick another.', code: 'DUPLICATE' } });
    log('error', 'post_update_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Update failed.', code: 'DB_ERROR' } });
  }
});

app.delete('/api/admin/posts/:id', requireAdmin, async function (req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ data: null, error: { message: 'Invalid id.', code: 'VALIDATION' } });
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ data: { deleted: true }, error: null });
  } catch (e) {
    log('error', 'post_delete_failed', { message: e.message });
    res.status(500).json({ data: null, error: { message: 'Delete failed.', code: 'DB_ERROR' } });
  }
});

/* ---------- start ---------- */

migrate()
  .then(function () {
    app.listen(PORT, function () { log('info', 'listening', { port: PORT }); });
  })
  .catch(function (e) {
    log('fatal', 'migrate_failed', { message: e.message });
    process.exit(1);
  });
