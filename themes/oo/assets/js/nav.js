// Boosted navigation ("PJAX"). Intercepts same-origin link clicks, fetches the
// target page, and swaps only #swap in place - the shell (background canvas and
// the persistent #player) is never touched, so audio keeps playing gapless as you
// move between pages. Pure progressive enhancement: with JS off, or on any error,
// links fall back to normal full-page navigation, and every page is fully
// server-rendered for crawlers.
(function () {
  "use strict";

  var main = document.getElementById("swap");
  if (!main || !window.history || !window.fetch || !window.DOMParser) return;

  // Guard against double-init if the script is ever evaluated twice.
  if (window.__ooNav) return;
  window.__ooNav = true;

  var ASSET_RE = /\.(xml|json|mp3|mp4|webm|jpe?g|png|gif|svg|webp|pdf|zip|txt|ico)$/i;
  var inFlight = null; // AbortController for the current navigation
  var cache = new Map(); // url -> html, warmed by hover-prefetch and past visits
  var CACHE_MAX = 12;
  var prefetching = {}; // url -> true while a prefetch is in flight

  function remember(url, html) {
    if (cache.has(url)) cache.delete(url); // move to newest
    cache.set(url, html);
    while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  }

  function isBoostable(a) {
    if (!a || !a.getAttribute) return false;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download")) return false;
    if (a.getAttribute("rel") === "external") return false;
    if (a.hasAttribute("data-no-boost")) return false;
    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    if (ASSET_RE.test(url.pathname)) return false; // let feeds/assets hard-load
    return true;
  }

  function setBusy(on) {
    document.documentElement.setAttribute("data-nav", on ? "loading" : "idle");
  }

  function runScripts(container) {
    // Re-execute inline scripts inside the swapped region (skip JSON data blocks).
    // Sub-pages carry ~no page JS today, but keep this so future page scripts run.
    var scripts = container.querySelectorAll("script");
    for (var i = 0; i < scripts.length; i++) {
      var old = scripts[i];
      if (old.type && old.type === "application/json") continue;
      var s = document.createElement("script");
      for (var j = 0; j < old.attributes.length; j++) {
        s.setAttribute(old.attributes[j].name, old.attributes[j].value);
      }
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    }
  }

  function swap(html, url, restoreScroll) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var next = doc.getElementById("swap");
    if (!next) { hardNav(url); return; }

    main.innerHTML = next.innerHTML;
    document.title = doc.title || document.title;
    // body class carries is-home/is-sub + no-bg - drives player expand/collapse
    // and background visibility.
    if (doc.body) document.body.className = doc.body.className;

    runScripts(main);

    if (typeof restoreScroll === "number") {
      window.scrollTo(0, restoreScroll);
    } else {
      window.scrollTo(0, 0);
      // move focus to the new content for keyboard/screen-reader users
      var focusTarget = main.querySelector("h1, h2, [tabindex]");
      if (focusTarget) {
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus({ preventScroll: true });
      }
    }

    // let the persistent player re-dock/collapse for the new page
    document.dispatchEvent(new Event("oo:navigated"));
  }

  function hardNav(url) { window.location.href = url; }

  function fetchPage(url, signal) {
    return fetch(url, {
      headers: { "X-Requested-With": "fetch" },
      credentials: "same-origin",
      signal: signal,
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      // A redirect to a different path (e.g. the preview→/ bounce) - signal a hard nav.
      if (res.redirected && res.url !== url) return { redirect: res.url };
      return res.text().then(function (html) { return { html: html }; });
    });
  }

  // Warm the cache on hover/touch intent so the click is instant.
  function prefetch(url) {
    if (cache.has(url) || prefetching[url] || url === location.href) return;
    prefetching[url] = true;
    fetchPage(url, undefined)
      .then(function (r) { if (r && r.html != null) remember(url, r.html); })
      .catch(function () {})
      .then(function () { delete prefetching[url]; });
  }

  function navigate(url, opts) {
    opts = opts || {};

    // Instant path: already prefetched or visited.
    if (cache.has(url)) {
      setBusy(false);
      if (opts.push) history.pushState({ boosted: true }, "", url);
      swap(cache.get(url), url, opts.scroll);
      return;
    }

    if (inFlight) inFlight.abort();
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    inFlight = ctrl;
    setBusy(true);

    fetchPage(url, ctrl ? ctrl.signal : undefined)
      .then(function (r) {
        inFlight = null;
        setBusy(false);
        if (r.redirect) { hardNav(r.redirect); return; }
        remember(url, r.html);
        if (opts.push) history.pushState({ boosted: true }, "", url);
        swap(r.html, url, opts.scroll);
      })
      .catch(function (err) {
        if (err && err.name === "AbortError") return;
        setBusy(false);
        hardNav(url); // network/parse failure → let the browser do it
      });
  }

  // Prefetch on hover/touch intent.
  function onIntent(e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!isBoostable(a)) return;
    try { prefetch(new URL(a.href, location.href).href); } catch (err) {}
  }
  document.addEventListener("mouseover", onIntent);
  document.addEventListener("touchstart", onIntent, { passive: true });
  document.addEventListener("focusin", onIntent);

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!isBoostable(a)) return;

    var url = new URL(a.href, location.href);
    // Same path, only a hash change → let the browser jump/scroll natively.
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    // Exact same URL → no-op.
    if (url.href === location.href) { e.preventDefault(); return; }

    e.preventDefault();
    navigate(url.href, { push: true });
  });

  window.addEventListener("popstate", function () {
    // Back/forward: reload the entry. Scroll 0 for simplicity (browsers also
    // restore native scroll on some paths); refine later if needed.
    navigate(location.href, { push: false, scroll: 0 });
  });

  // Seed history so the first back press has state to return to.
  history.replaceState({ boosted: true }, "", location.href);
})();
