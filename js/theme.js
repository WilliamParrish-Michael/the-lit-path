/* ============================================================
   The Lit Path — day/night theme
   Loaded in <head> on every page (tiny, synchronous) so the chosen
   theme applies before first paint — no flash of the wrong colors.
   - Default: follow the device setting (prefers-color-scheme).
   - The floating toggle (injected below) lets a visitor override it;
     the choice is remembered in localStorage under "litpath-theme".
   - Accessible: a real <button> with aria-label + aria-pressed, and
     keyboard reachable. Never required for anything else on the site.
   ============================================================ */
(function () {
  var KEY = 'litpath-theme';
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function current() {
    var s = stored();
    if (s === 'dark' || s === 'light') return s;
    return systemDark() ? 'dark' : 'light';
  }
  function apply(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) { try { localStorage.setItem(KEY, theme); } catch (e) {} }
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode');
      btn.title = btn.getAttribute('aria-label');
    }
  }

  /* 1. Apply immediately (before paint) */
  var s = stored();
  if (s === 'dark' || s === 'light') root.setAttribute('data-theme', s);

  /* 2. Follow the device if the visitor has not chosen */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (!stored()) apply(current(), false);
    });
  }

  /* 3. Inject the floating toggle once the body exists */
  function mount() {
    if (document.querySelector('.theme-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.innerHTML =
      '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>' +
      '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    btn.addEventListener('click', function () {
      apply(current() === 'dark' ? 'light' : 'dark', true);
    });
    document.body.appendChild(btn);
    apply(current(), false);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
